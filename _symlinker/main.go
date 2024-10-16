package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
)

func main() {
	// Read DB_URL from environment variables
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL environment variable is not set")
	}
	dbURL += "?sslmode=disable"

	// Connect to the database
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Execute the query
	query := `
        SELECT t.id, t.tag, m.id, m.name 
        FROM "Tags" t 
        LEFT JOIN "_MediaToTags" tm ON t.id = tm."B" 
        RIGHT JOIN "Media" m ON tm."A" = m.id
        WHERE t."parentId" = 45
    `
	rows, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	// Process the results
	for rows.Next() {
		var tagID int
		var tagName string
		var mediaID string
		var mediaName string

		if err := rows.Scan(&tagID, &tagName, &mediaID, &mediaName); err != nil {
			log.Fatal(err)
		}

		// Create the directory structure
		dirPath := fmt.Sprintf("/hierarchy/%s_%d", tagName, tagID)
		if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
			log.Fatal(err)
		}

		// Create the symlink
		symlinkPath := filepath.Join(dirPath, fmt.Sprintf("%s_%s", mediaName, mediaID))
		targetPath := fmt.Sprintf("/media/%s", mediaID)
		if err := os.Symlink(targetPath, symlinkPath); err != nil {
			log.Fatal(err)
		}
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Symlinks created successfully")
}
