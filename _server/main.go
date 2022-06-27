package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/Jeffail/gabs"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gin-gonic/gin"
	ffmpeg "github.com/u2takey/ffmpeg-go"
	"gorm.io/driver/sqlite"
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

	db, err := gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&Cluster{})
	db.AutoMigrate(&Tag{})
	db.AutoMigrate(&Group{})
	db.AutoMigrate(&Media{})

	r.GET("/clusters", func(c *gin.Context) {

		var clusters []Cluster
		db.Find(&clusters)

		c.JSON(200, clusters)
	})

	r.GET("/:cluster/tags", func(c *gin.Context) {
		cluster, err := getCluster(c, db)
		if err != nil {
			return
		}

		// TODO: Re-add count
		type Tag_json struct {
			Id    int    `json:"id"`
			Name  string `json:"name"`
			Count int    `json:"count"`
		}

		var tags []Tag
		db.Model(&Tag{}).Where(&Tag{Cluster: cluster}).Scan(&tags)

		c.JSON(200, tags)
	})

	r.GET("/:cluster/groups", func(c *gin.Context) {

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
			db.Raw("SELECT Name, Icon, (select group_concat(id) FROM groups as g WHERE g.parent == groups.id) as Children FROM groups WHERE id = ?", Id).Scan(&result)

			group.Name = result.Name
			group.Icon = result.Icon
			group.Children = []Group_json{}

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
		db.Raw("SELECT id, name FROM groups WHERE parent IS false AND cluster IS ?", c.Param("cluster")).Scan(&primaryGroups)

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
			Parent int
		}

		err := json.NewDecoder(c.Request.Body).Decode(&g)
		if err != nil {
			c.String(400, "Could not decode body")
			return
		}

		db.Create(&Group{Cluster: cluster, Name: g.Name, Parent: g.Parent})

		c.Status(200)

	})

	r.GET("/:cluster/:group/media", func(c *gin.Context) {
		group, _ := strconv.Atoi(c.Param("group"))

		var media []Media
		if group != -1 {
			db.Model(&Media{}).Where(&Media{Group: group}).Scan(&media)
		} else {
			db.Model(&Media{}).Where("`group` IS NULL").Scan(&media)
		}

		c.JSON(200, media)
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

	r.GET("/:cluster/media/:id", func(c *gin.Context) {
		cluster, err := getClusterString(c, db)
		if err != nil {
			return
		}
		id := c.Param("id")

		content, err := ioutil.ReadFile("media/" + cluster + "/" + id)
		if err != nil {
			log.Printf("failed to open image: %v", err)
		}

		c.Data(200, mimetype.Detect(content).String(), content)
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

	r.Run() // listen and serve on 0.0.0.0:8080
}
