package config

type Cluster struct {
	Id   int    `json:"id" gorm:"primaryKey;"`
	Name string `json:"name"`
}

//#region test

type Tag struct {
	Id   int    `json:"id" gorm:"primaryKey;"`
	Name string `json:"name"`
}

type Group struct {
	Id        int `gorm:"primaryKey;"`
	Cluster   int
	Name      string
	Parent    int `gorm:"default:null"`
	Icon      string
	Collapsed bool
}

//#endregion

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
