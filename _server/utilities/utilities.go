package utilities

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"

	"ant.ms/stash/config"

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
	clusterId, _ := strconv.Atoi(c.Param("cluster"))

	var count int64
	db.Model(&config.Cluster{}).Where(&config.Cluster{Id: clusterId}).Count(&count)

	if count < 1 {
		c.String(404, "Cluster not found")
		return "-1", errors.New("Cluster not found")
	}

	return strconv.Itoa(clusterId), nil
}

func GetGroup(c *gin.Context, db *gorm.DB) (int, error) {
	clusterId, _ := GetCluster(c, db)
	groupId, _ := strconv.Atoi(c.Param("group"))

	var count int64
	db.Model(&config.Group{}).Where(&config.Group{Id: groupId, Cluster: clusterId}).Count(&count)

	if count < 1 {
		c.String(404, "Group not Group")
		return -1, errors.New("Cluster not found")
	}

	return groupId, nil
}
func GetGroupString(c *gin.Context, db *gorm.DB) (string, error) {
	groupId, err := GetGroup(c, db)
	return strconv.Itoa(groupId), err
}
