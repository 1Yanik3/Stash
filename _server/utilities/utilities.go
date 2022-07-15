package utilities

import (
	"errors"
	"fmt"
	"log"
	"math/rand"
	"strconv"

	"ant.ms/stash/config"

	gabs "github.com/Jeffail/gabs/v2"
	"github.com/gin-gonic/gin"
	ffmpeg "github.com/u2takey/ffmpeg-go"
	"gorm.io/gorm"
)

func ConvertStringArrayToIntArray(input []string) []int {
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

func FilterStringArray(input []string) []string {
	var output = []string{}

	for _, i := range input {
		if i != "" {
			output = append(output, i)
		}
	}

	return output
}

func IsInArray(query string, array []string) bool {
	var result bool = false
	for _, x := range array {
		if x == query {
			result = true
			break
		}
	}
	return result
}

func GetCluster(c *gin.Context, db *gorm.DB) (int, error) {
	clusterId, _ := strconv.Atoi(c.Param("cluster"))

	var count int64
	db.Model(&config.Cluster{}).Where(&config.Cluster{Id: clusterId}).Count(&count)

	if count < 1 {
		c.String(404, "Cluster not found")
		return -1, errors.New("Cluster not found")
	}

	return clusterId, nil
}
func GetClusterString(c *gin.Context, db *gorm.DB) (string, error) {
	groupId, err := GetCluster(c, db)
	return strconv.Itoa(groupId), err
}

func GetGroup(c *gin.Context, db *gorm.DB) (int, error) {
	clusterId, _ := GetCluster(c, db)
	groupId, _ := strconv.Atoi(c.Param("group"))

	var count int64
	db.Model(&config.Group{}).Where(&config.Group{Id: groupId, Cluster: clusterId}).Count(&count)

	if count < 1 {
		c.String(404, "Group not found")
		return -1, errors.New("Cluster not found")
	}

	return groupId, nil
}
func GetGroupString(c *gin.Context, db *gorm.DB) (string, error) {
	groupId, err := GetGroup(c, db)
	return strconv.Itoa(groupId), err
}

func GetMedia(c *gin.Context, db *gorm.DB) (int, error) {
	clusterId, _ := GetCluster(c, db)
	mediaId, _ := strconv.Atoi(c.Param("id"))

	var count int64
	db.Model(&config.Media{}).Where(&config.Media{Id: mediaId, Cluster: clusterId}).Count(&count)

	if count < 1 {
		c.String(404, "Media not found")
		return -1, errors.New("Media not found")
	}

	return mediaId, nil
}

func GetTagId(c *gin.Context, db *gorm.DB) (int, error) {
	name := c.Param("tag")

	var tagId int
	db.Model(&config.Tag{}).Select("id").Where(&config.Tag{Name: name}).Scan(&tagId)

	if tagId < 1 {
		c.String(404, "Tag not found")
		return -1, errors.New("Tag not found")
	}

	return tagId, nil
}

func RandomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}

func UpdateMediaInformation(db *gorm.DB, cluster int, mediaId int) (int, int) {
	log.Print("Updating media information...")

	information, err := ffmpeg.Probe(fmt.Sprintf("media/%d/%d", cluster, mediaId))
	if err != nil {
		log.Print(err)
		return -1, -1
	}

	jsonParsed, err := gabs.ParseJSON([]byte(information))
	if err != nil {
		log.Print(err)
		return -1, -1
	}

	width := jsonParsed.Search("streams", "*", "width").Index(0).Data().(float64)
	height := jsonParsed.Search("streams", "*", "height").Index(0).Data().(float64)
	rotation, ok := jsonParsed.Search("streams", "*", "side_data_list", "*", "rotation").Index(0).Index(0).Data().(float64)
	if !ok {
		rotation = 0
	}

	if rotation == 90 || rotation == -90 {
		tmp := width
		width = height
		height = tmp
	}

	db.
		Where(&config.Media{
			Id: mediaId,
		}).
		Updates(&config.Media{
			Width:  int(width),
			Height: int(height),
		})

	return int(width), int(height)

}
