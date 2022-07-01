package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/Jeffail/gabs"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gin-gonic/gin"
	ffmpeg "github.com/u2takey/ffmpeg-go"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Cluster struct {
	Id   int    `json:"id" gorm:"primaryKey;"`
	Name string `json:"name"`
}

type Tag struct {
	Id      int    `json:"id" gorm:"primaryKey;"`
	Name    string `json:"name"`
	Cluster int
}

type Group struct {
	Id      int `gorm:"primaryKey;"`
	Cluster int
	Name    string
	Parent  int
	Icon    string
}

type Media struct {
	Id      int    `json:"id" gorm:"primaryKey"`
	Type    string `json:"type"`
	Name    string `json:"name"`
	Date    int64  `gorm:"autoCreateTime"`
	Cluster int
	Group   int
}

type TagMediaLink struct {
	TagId   int
	MediaId int
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST,HEAD,PATCH, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func getCluster(c *gin.Context, db *gorm.DB) (int, error) {
	clusterId, _ := strconv.Atoi(c.Param("cluster"))

	var count int64
	db.Model(&Cluster{}).Where(&Cluster{Id: clusterId}).Count(&count)

	if count < 1 {
		c.String(404, "Cluster not found")
		return -1, errors.New("Cluster not found")
	}

	return clusterId, nil
}
func getClusterString(c *gin.Context, db *gorm.DB) (string, error) {
	clusterId, _ := strconv.Atoi(c.Param("cluster"))

	var count int64
	db.Model(&Cluster{}).Where(&Cluster{Id: clusterId}).Count(&count)

	if count < 1 {
		c.String(404, "Cluster not found")
		return "-1", errors.New("Cluster not found")
	}

	return strconv.Itoa(clusterId), nil
}

func getGroup(c *gin.Context, db *gorm.DB) (int, error) {
	clusterId, _ := getCluster(c, db)
	groupId, _ := strconv.Atoi(c.Param("group"))

	var count int64
	db.Model(&Group{}).Where(&Group{Id: groupId, Cluster: clusterId}).Count(&count)

	if count < 1 {
		c.String(404, "Group not Group")
		return -1, errors.New("Cluster not found")
	}

	return groupId, nil
}
func getGroupString(c *gin.Context, db *gorm.DB) (string, error) {
	groupId, err := getGroup(c, db)
	return strconv.Itoa(groupId), err
}

func convertStringArrayToIntArray(input []string) []int {
	var output = []int{}

	for _, i := range input {
		if i != "" {

			j, err := strconv.Atoi(i)
			if err != nil {
				panic(err)
			}
			output = append(output, j)

		}
	}

	return output
}

func filterStringArray(input []string) []string {
	var output = []string{}

	for _, i := range input {
		if i != "" {
			output = append(output, i)
		}
	}

	return output
}

func isInArray(query string, array []string) bool {
	var result bool = false
	for _, x := range array {
		if x == query {
			result = true
			break
		}
	}
	return result
}

func main() {
	r := gin.Default()
	r.Use(CORSMiddleware())

	dsn := "host=100.89.255.87 user=postgres password=gorm123 dbname=postgres port=23077 sslmode=disable TimeZone=Europe/Zurich"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&Cluster{})
	db.AutoMigrate(&Tag{})
	db.AutoMigrate(&Group{})
	db.AutoMigrate(&Media{})
	db.AutoMigrate(&TagMediaLink{})

	r.GET("/clusters", func(c *gin.Context) {

		var clusters []Cluster
		db.Find(&clusters)

		c.JSON(200, clusters)
	})

	// TODO: make group based (as some groups might not include the same amount of tags)
	r.GET("/:cluster/:group/tags", func(c *gin.Context) {
		cluster, clusterErr := getClusterString(c, db)
		group, groupErr := getGroupString(c, db)

		if clusterErr != nil || groupErr != nil {
			return
		}

		type Tag_json struct {
			Id    int    `json:"id"`
			Name  string `json:"name"`
			Count int    `json:"count"`
		}

		// TODO: Exception for -3 and -1
		tags := []Tag_json{}
		db.Raw(`
			SELECT tags.Id, tags.Name, COUNT(*) as Count
			FROM tags
			LEFT JOIN tag_media_links
			ON tag_media_links.tag_id == tags.id
			LEFT JOIN media
			ON media.id == tag_media_links.media_id
			WHERE tags.cluster = ? AND media."group" = ?
			GROUP BY tags.Id`,
			cluster, group).Scan(&tags)

		c.JSON(200, tags)
	})

	r.GET("/:cluster/groups", func(c *gin.Context) {
		cluster, clusterErr := getCluster(c, db)
		if clusterErr != nil {
			return
		}

		type Group_json struct {
			Id       int          `json:"id"`
			Name     string       `json:"name"`
			Icon     string       `json:"icon"`
			Children []Group_json `json:"children"`
		}

		var newGroup func(Id int) Group_json
		newGroup = func(Id int) Group_json {
			group := Group_json{}
			group.Id = Id

			var result struct {
				Name     string
				Children string
				Icon     string
			}
			db.Raw(`
				SELECT Name, Icon, (
					select array_to_string(array_agg(id), ',') FROM groups as g WHERE g.parent = groups.id
				) as Children
				FROM groups
				WHERE id = ? ORDER BY Name ASC
			`, Id).Scan(&result)

			group.Name = result.Name
			group.Icon = result.Icon

			group.Children = []Group_json{}
			for _, i := range convertStringArrayToIntArray(strings.Split(result.Children, ",")) {
				group.Children = append(group.Children, newGroup(i))
			}

			return group
		}

		var primaryGroups []struct {
			Id   int    `json:"id"`
			Name string `json:"name"`
		}
		db.Raw("SELECT id, name FROM groups WHERE parent IS NULL AND cluster = ?", cluster).Scan(&primaryGroups)

		var output = []Group_json{}

		output = append(output, Group_json{
			Id:       -1,
			Name:     "Unsorted",
			Children: []Group_json{},
		})
		output = append(output, Group_json{
			Id:       -2,
			Name:     "Trash",
			Children: []Group_json{},
		})
		output = append(output, Group_json{
			Id:       -3,
			Name:     "Everything",
			Children: []Group_json{},
		})

		for _, i := range primaryGroups {
			output = append(output, newGroup(i.Id))
		}

		c.JSON(200, output)
	})

	r.POST("/:cluster/groups", func(c *gin.Context) {
		cluster, _ := getCluster(c, db)

		if c.Request.Body == nil {
			c.String(400, "Please send a request body")
			return
		}

		var g struct {
			Name   string
			Parent *int
		}

		err := json.NewDecoder(c.Request.Body).Decode(&g)
		if err != nil {
			c.String(400, "Could not decode body")
			return
		}

		if *g.Parent < 0 {
			g.Parent = nil
		}

		db.Create(&Group{Cluster: cluster, Name: g.Name, Parent: *g.Parent})

		c.Status(200)

	})

	r.GET("/:cluster/:group/media", func(c *gin.Context) {
		cluster, _ := strconv.Atoi(c.Param("cluster"))
		group, _ := strconv.Atoi(c.Param("group"))

		// TODO: optimize
		type Media_result struct {
			Id   int
			Type string
			Name string
			Date int64
			Tags string
		}

		type Media_json struct {
			Id   int      `json:"id"`
			Type string   `json:"type"`
			Name string   `json:"name"`
			Date int64    `json:"date"`
			Tags []string `json:"tags"`
		}

		whereClause := fmt.Sprintf(`AND "group" = %d`, group)
		if group == -1 {
			whereClause = `AND "group" IS NULL`
		}
		if group == -3 {
			whereClause = ""
		}
		whereClause = fmt.Sprintf(`WHERE "cluster" = %d `, cluster) + whereClause

		var media []Media_result
		db.Raw(`
			SELECT media.Id, media.Type, media.Name, Date,
			coalesce((
				SELECT array_to_string(array_agg(tags.name), ',')
				FROM tags
				INNER JOIN tag_media_links
				ON tags.id = tag_id
				WHERE media_id = media.id
			), '') as Tags
			FROM media
		` + whereClause).Scan(&media)

		result := []Media_json{}
		for _, i := range media {
			result = append(result, Media_json{
				Id:   i.Id,
				Type: i.Type,
				Name: i.Name,
				Date: i.Date,
				Tags: filterStringArray(strings.Split(i.Tags, ",")),
			})
		}

		c.JSON(200, result)
	})

	r.POST("/:cluster/:group/media", func(c *gin.Context) {
		cluster, err := getCluster(c, db)
		if err != nil {
			return
		}
		// move into -1 instead of failing
		group, err := getGroup(c, db)
		if err != nil {
			return
		}

		file, err := c.FormFile("file")
		if err != nil {
			log.Fatal(err)
		}

		src, _ := file.Open()
		defer src.Close()
		media_type, _ := mimetype.DetectReader(src)
		log.Println(media_type.String())

		if !strings.HasPrefix(media_type.String(), "image") && !strings.HasPrefix(media_type.String(), "video") {
			c.Status(415)
			return
		}

		media := &Media{Type: media_type.String(), Name: file.Filename, Cluster: cluster, Group: group}
		db.Create(&media)

		c.SaveUploadedFile(file, "media/"+strconv.Itoa(cluster)+"/"+strconv.Itoa(media.Id))

		c.Status(200)
	})

	// r.GET("/:cluster/media/:id", func(c *gin.Context) {
	// 	cluster, err := getClusterString(c, db)
	// 	if err != nil {
	// 		return
	// 	}
	// 	id := c.Param("id")

	// 	content, err := ioutil.ReadFile("media/" + cluster + "/" + id)
	// 	if err != nil {
	// 		log.Printf("failed to open media: %v", err)
	// 	}

	// 	c.Data(200, mimetype.Detect(content).String(), content)
	// })

	clusters := []Cluster{}
	db.Model(&Cluster{}).Scan(&clusters)
	for _, i := range clusters {
		r.Static(fmt.Sprintf("/%d/file", i.Id), fmt.Sprintf("media/%d", i.Id))
	}

	// TODO
	r.DELETE("/:cluster/media/:id", func(c *gin.Context) {
		// if is already in deleted group
		// => delete permanently

		// if is not already in deleted group
		// => move to deleted group
	})

	// TODO
	r.PUT("/:cluster/media/:id/tag", func(c *gin.Context) {
		cluster, clusterErr := getCluster(c, db)
		if clusterErr != nil {
			return
		}
		id, _ := strconv.Atoi(c.Param("id"))

		if c.Request.Body == nil {
			c.String(400, "Please send a request body")
			return
		}

		var g struct {
			Name string
		}

		err := json.NewDecoder(c.Request.Body).Decode(&g)
		if err != nil {
			c.String(400, "Could not decode body")
			return
		}

		var tag Tag
		db.Find(&Tag{}).Where(&Tag{Name: g.Name, Cluster: cluster}).Find(&tag)

		// tag does not exist yet
		if tag.Id == 0 {
			tag = Tag{Name: g.Name, Cluster: cluster}
			db.Create(&tag)
		}

		// link
		db.Create(&TagMediaLink{TagId: tag.Id, MediaId: id})

	})

	// TODO
	r.DELETE("/:cluster/media/:id/tag/:tag", func(c *gin.Context) {

	})

	r.GET("/:cluster/media/:id/thumbnail", func(c *gin.Context) {
		cluster, clusterError := getClusterString(c, db)
		if clusterError != nil {
			return
		}
		id := c.Param("id")

		var thumbnailPath = "thumbnails/" + cluster + "/" + id + ".webp"

		var original []byte
		var err error
		original, err = ioutil.ReadFile(thumbnailPath)
		if err != nil {

			log.Printf("Thumbnail not found, creating new one: %v", err)

			buf := bytes.NewBuffer(nil)

			err := ffmpeg.
				Input("media/"+cluster+"/"+id).
				Filter("scale", ffmpeg.Args{"w=650:h=650:force_original_aspect_ratio=increase"}).
				Output("pipe:", ffmpeg.KwArgs{"vframes": 1, "format": "image2", "vcodec": "libwebp"}).
				WithOutput(buf, os.Stdout).Run()

			if err != nil {
				c.String(422, "Failed to encode")
				log.Print(err)
				return
			}

			original = buf.Bytes()

			ioutil.WriteFile(thumbnailPath, original, 0750)

		}

		c.Data(200, "images/webp", original)
	})

	r.GET("/:cluster/media/:id/info", func(c *gin.Context) {
		cluster, err := getClusterString(c, db)
		if err != nil {
			return
		}
		id := c.Param("id")

		information, err := ffmpeg.Probe("media/" + cluster + "/" + id)
		if err != nil {
			c.String(422, "Failed to get media information")
			log.Print(err)
			return
		}

		jsonParsed, err := gabs.ParseJSON([]byte(information))
		if err != nil {
			c.String(422, "Failed to parse media information")
			log.Print(err)
			return
		}

		c.JSON(200, jsonParsed.Data())
	})

	r.Run(":80")
}
