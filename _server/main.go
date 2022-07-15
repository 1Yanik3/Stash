package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"strings"

	gabs "github.com/Jeffail/gabs/v2"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gin-gonic/gin"
	ffmpeg "github.com/u2takey/ffmpeg-go"

	"ant.ms/stash/config"
	"ant.ms/stash/utilities"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, HEAD, PATCH, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	r := gin.Default()
	r.Use(CORSMiddleware())

	dsn := "host=100.89.255.87 user=postgres password=gorm123 dbname=postgres port=23077 sslmode=disable TimeZone=Europe/Zurich"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		SkipDefaultTransaction: true,
		PrepareStmt:            true,
	})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&config.Cluster{})
	db.AutoMigrate(&config.Tag{})
	db.AutoMigrate(&config.Group{})
	db.AutoMigrate(&config.Media{})
	db.AutoMigrate(&config.TagMediaLink{})

	r.GET("/clusters", func(c *gin.Context) {

		var clusters []config.Cluster
		db.Find(&clusters)

		c.JSON(200, clusters)
	})

	r.GET("/", func(c *gin.Context) {
		c.Redirect(307, "https://confusedant.gitlab.io/stash")
	})

	// r.GET("/misc/placeholder/:width/:height", func(c *gin.Context) {

	// 	widthInt, widthErr := strconv.Atoi(c.Param("width"))
	// 	if widthErr != nil {
	// 		c.Status(400)
	// 		return
	// 	}
	// 	heightInt, heightErr := strconv.Atoi(c.Param("height"))
	// 	if heightErr != nil {
	// 		c.Status(400)
	// 		return
	// 	}

	// 	width := float64(widthInt)
	// 	height := float64(heightInt)

	// 	var k float64
	// 	if width > height {
	// 		k = 650 / width
	// 	} else {
	// 		k = 650 / height
	// 	}

	// 	c.Data(200, "image/svg+xml", []byte(fmt.Sprintf(`
	// 		<svg viewBox="0 0 %[1]v %[2]v" xmlns="http://www.w3.org/2000/svg">
	// 			<rect width="%[1]v" height="%[2]v" x="0" y="0"/>
	// 		</svg>
	// 	`, width*k, height*k)))

	// })

	//#region Group

	// TODO: make group based (as some groups might not include the same amount of tags)
	r.GET("/:cluster/:group/tags", func(c *gin.Context) {
		group, groupErr := utilities.GetGroupString(c, db)
		if groupErr != nil {
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
			ON tag_media_links.tag_id = tags.id
			LEFT JOIN media
			ON media.id = tag_media_links.media_id
			WHERE media."group" = ?
			GROUP BY tags.Id`, group).Scan(&tags)

		c.JSON(200, tags)
	})

	r.GET("/:cluster/groups", func(c *gin.Context) {
		cluster, clusterErr := utilities.GetCluster(c, db)
		if clusterErr != nil {
			return
		}

		type Group_json struct {
			Id        int          `json:"id"`
			Name      string       `json:"name"`
			Icon      string       `json:"icon"`
			Collapsed bool         `json:"collapsed"`
			Children  []Group_json `json:"children"`
		}

		var newGroup func(Id int) Group_json
		newGroup = func(Id int) Group_json {
			group := Group_json{}
			group.Id = Id

			var result struct {
				Name      string
				Children  string
				Icon      string
				Collapsed bool
			}
			db.Raw(`
				SELECT Name, Icon, (
					select array_to_string(array_agg(id), ',') FROM groups as g WHERE g.parent = groups.id
				) as Children, Collapsed
				FROM groups
				WHERE id = ? ORDER BY Name ASC
			`, Id).Scan(&result)

			group.Name = result.Name
			group.Icon = result.Icon
			group.Collapsed = result.Collapsed

			group.Children = []Group_json{}
			for _, i := range utilities.ConvertStringArrayToIntArray(strings.Split(result.Children, ",")) {
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
			Id:        -1,
			Name:      "Unsorted",
			Collapsed: false,
			Children:  []Group_json{},
		})
		output = append(output, Group_json{
			Id:        -2,
			Name:      "Trash",
			Collapsed: false,
			Children:  []Group_json{},
		})
		output = append(output, Group_json{
			Id:        -3,
			Name:      "Everything",
			Collapsed: false,
			Children:  []Group_json{},
		})

		for _, i := range primaryGroups {
			output = append(output, newGroup(i.Id))
		}

		c.JSON(200, output)
	})

	r.POST("/:cluster/groups", func(c *gin.Context) {
		cluster, _ := utilities.GetCluster(c, db)

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

		if g.Parent < 0 {
			db.Create(&config.Group{Cluster: cluster, Name: g.Name})
		} else {
			db.Create(&config.Group{Cluster: cluster, Name: g.Name, Parent: g.Parent, Collapsed: false})
		}

		c.Status(200)

	})

	r.PATCH("/:cluster/:group/collapsed/:state", func(c *gin.Context) {
		cluster, clusterErr := utilities.GetCluster(c, db)
		group, groupErr := utilities.GetGroup(c, db)
		if clusterErr != nil || groupErr != nil {
			return
		}

		log.Print(c.Param("state") == "true")

		db.Model(&config.Group{}).
			Where(&config.Group{Id: group, Cluster: cluster}).
			Update("collapsed", c.Param("state") == "true")

	})

	r.GET("/:cluster/:group/media", func(c *gin.Context) {
		cluster, _ := strconv.Atoi(c.Param("cluster"))
		group, _ := strconv.Atoi(c.Param("group"))

		// TODO: optimize
		type Media_result struct {
			Id     int
			Type   string
			Name   string
			Date   int64
			Tags   string
			Width  int
			Height int
		}

		type Media_json struct {
			Id     int      `json:"id"`
			Type   string   `json:"type"`
			Name   string   `json:"name"`
			Date   int64    `json:"date"`
			Tags   []string `json:"tags"`
			Width  int      `json:"width"`
			Height int      `json:"height"`
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
			), '') as Tags, media.Width, media.Height
			FROM media
		` + whereClause).Scan(&media)

		result := []Media_json{}
		for _, i := range media {
			if i.Width < 1 || i.Height < 1 {
				i.Width, i.Height = utilities.UpdateMediaInformation(db, cluster, i.Id)
			}

			result = append(result, Media_json{
				Id:     i.Id,
				Type:   i.Type,
				Name:   i.Name,
				Date:   i.Date,
				Tags:   utilities.FilterStringArray(strings.Split(i.Tags, ",")),
				Width:  i.Width,
				Height: i.Height,
			})
		}

		c.JSON(200, result)
	})

	r.POST("/:cluster/:group/media", func(c *gin.Context) {
		log.Print("Request start...")

		cluster, err := utilities.GetCluster(c, db)
		if err != nil {
			return
		}

		// TODO: move into -1 instead of failing
		group, err := utilities.GetGroup(c, db)
		if err != nil {
			return
		}

		// TODO: this is where it sometimes gets stuck
		log.Print("Get file...")

		file, err := c.FormFile("file")
		if err != nil {
			log.Fatal("Failed to get file", err)
			c.Status(500)
			return
		}

		log.Print("Open file...")

		src, err := file.Open()
		if err != nil {
			log.Fatal("Failed to open file", err)
			c.Status(500)
			return
		}
		defer src.Close()

		log.Print("Detect mimetype...")
		media_type, _ := mimetype.DetectReader(src)

		if !strings.HasPrefix(media_type.String(), "image") && !strings.HasPrefix(media_type.String(), "video") {
			c.Status(415)
			return
		}

		log.Print("Add to DB...")

		media := &config.Media{Type: media_type.String(), Name: file.Filename, Cluster: cluster, Group: group}
		db.Create(&media)

		log.Print("Save file...")

		err = c.SaveUploadedFile(file, "media/"+strconv.Itoa(cluster)+"/"+strconv.Itoa(media.Id))
		if err != nil {
			log.Fatal("failed to save file", err)
			c.Status(500)
			return
		}

		log.Print("Update height and width of image...")
		utilities.UpdateMediaInformation(db, cluster, media.Id)

		c.Status(200)
	})

	//#endregion

	//#region Medium

	clusters := []config.Cluster{}
	db.Model(&config.Cluster{}).Scan(&clusters)
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

	r.POST("/:cluster/media/:id/upscale", func(c *gin.Context) {
		cluster, clusterError := utilities.GetClusterString(c, db)
		if clusterError != nil {
			log.Fatal(err)
			return
		}
		id := c.Param("id")

		mediaPath := "media/" + cluster + "/" + id

		buffer := new(bytes.Buffer)
		writer := multipart.NewWriter(buffer)

		part, _ := writer.CreateFormFile("image", "input.jpg")

		// read file
		file, _ := os.ReadFile(mediaPath)
		part.Write(file)

		writer.Close()

		// TODO: Do both and then allow user to choose which is better
		// req, err := http.NewRequest("POST", "https://api.deepai.org/api/torch-srgan", buffer)
		req, err := http.NewRequest("POST", "https://api.deepai.org/api/waifu2x", buffer)
		if err != nil {
			log.Fatal(err)
		}
		req.Header.Add("api-key", "84ff9126-dd63-49bb-87a2-2304165beede")
		req.Header.Add("Content-Type", writer.FormDataContentType())

		response, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Fatal(err)
		}
		defer response.Body.Close()

		log.Print("Return response...")

		var result map[string]interface{}
		json.NewDecoder(response.Body).Decode(&result)
		c.JSON(200, result)

	})

	r.PUT("/:cluster/media/:id/replace", func(c *gin.Context) {
		clusterString, clusterStringError := utilities.GetClusterString(c, db)
		cluster, clusterError := utilities.GetCluster(c, db)
		if clusterStringError != nil || clusterError != nil {
			return
		}
		id := c.Param("id")

		mediaPath := "media/" + clusterString + "/" + id
		thumbnailPath := "thumbnails/" + clusterString + "/" + id + ".webp"

		// move file
		err = os.Rename(mediaPath, mediaPath+"."+utilities.RandomString(10))
		if err != nil {
			return
		}
		err = os.Remove(thumbnailPath)
		if err != nil {
			return
		}

		// save new file
		file, err := c.FormFile("file")
		if err != nil {
			log.Fatal("Failed to get file", err)
			c.Status(500)
			return
		}

		src, err := file.Open()
		if err != nil {
			log.Fatal("Failed to open file", err)
			c.Status(500)
			return
		}
		defer src.Close()
		media_type, _ := mimetype.DetectReader(src)

		if !strings.HasPrefix(media_type.String(), "image") && !strings.HasPrefix(media_type.String(), "video") {
			c.Status(415)
			return
		}

		err = c.SaveUploadedFile(file, mediaPath)
		if err != nil {
			log.Fatal("failed to save file", err)
			c.Status(500)
			return
		}

		mediaId, _ := strconv.Atoi(id)
		utilities.UpdateMediaInformation(db, cluster, mediaId)

		c.Status(200)

	})

	r.PUT("/:cluster/media/:id/tag", func(c *gin.Context) {
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

		var tag config.Tag
		db.Find(&config.Tag{}).Where(&config.Tag{Name: g.Name}).Find(&tag)

		// tag does not exist yet
		if tag.Id == 0 {
			tag = config.Tag{Name: g.Name}
			db.Create(&tag)
		}

		// link
		db.Create(&config.TagMediaLink{TagId: tag.Id, MediaId: id})

	})

	r.DELETE("/:cluster/media/:id/tag/:tag", func(c *gin.Context) {
		media, mediaError := utilities.GetMedia(c, db)
		if mediaError != nil {
			return
		}
		tag, tagError := utilities.GetTagId(c, db)
		if tagError != nil {
			return
		}

		db.Where(&config.TagMediaLink{
			TagId:   tag,
			MediaId: media,
		}).Delete(&config.TagMediaLink{})

		c.Status(200)
	})

	r.GET("/:cluster/media/:id/thumbnail", func(c *gin.Context) {
		cluster, clusterError := utilities.GetClusterString(c, db)
		if clusterError != nil {
			return
		}
		id := c.Param("id")

		mediaPath := "media/" + cluster + "/" + id
		thumbnailPath := "thumbnails/" + cluster + "/" + id + ".webp"

		var thumbnail []byte
		var err error
		thumbnail, err = ioutil.ReadFile(thumbnailPath)
		if err != nil {
			log.Printf("Thumbnail not found: %v", err)

			// if not exist
			if _, err := os.Stat(mediaPath); errors.Is(err, os.ErrNotExist) {
				c.Status(404)
				return
			}

			rawProbe, probeError := ffmpeg.Probe(mediaPath)
			if probeError != nil {
				c.Status(404)
				return
			}

			probe, parseError := gabs.ParseJSON([]byte(rawProbe))
			if parseError != nil {
				c.String(422, "Failed to parse media information")
				log.Print(err)
				return
			}

			media_type, _ := mimetype.DetectFile(mediaPath)
			arguments := ffmpeg.KwArgs{"vframes": 1, "format": "image2", "vcodec": "libwebp"}
			if strings.HasPrefix(media_type.String(), "video") {
				duration, _ := probe.Search("format", "duration").Data().(float64)
				timestamp := 7
				if duration < 7 {
					timestamp = int(duration / 2)
				}

				arguments = ffmpeg.KwArgs{"vframes": 1, "ss": timestamp, "format": "image2", "vcodec": "libwebp"}
			}

			buf := bytes.NewBuffer(nil)
			err := ffmpeg.
				Input(mediaPath).
				Filter("scale", ffmpeg.Args{"w=650:h=650:force_original_aspect_ratio=increase"}).
				Output("pipe:", arguments).
				WithOutput(buf, os.Stdout).Run()

			if err != nil {
				c.String(422, "Failed to encode")
				log.Print(err)
				return
			}

			thumbnail = buf.Bytes()

			ioutil.WriteFile(thumbnailPath, thumbnail, 0750)

		}

		c.Data(200, "images/webp", thumbnail)
	})

	r.GET("/:cluster/media/:id/info", func(c *gin.Context) {
		cluster, err := utilities.GetClusterString(c, db)
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

	//#endregion

	r.Run(":80")
}
