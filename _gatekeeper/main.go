package main

import (
	"database/sql"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

	_ "github.com/jackc/pgx/v4/stdlib" // PostgreSQL driver
)

func main() {
	// Load environment variables
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL environment variable is not set")
	}

	proxyTargetURL := os.Getenv("PROXY_TARGET_URL")
	if proxyTargetURL == "" {
		log.Fatal("PROXY_TARGET_URL environment variable is not set")
	}

	// Database connection setup
	db, err := sql.Open("pgx", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// Middleware to check session header for each request
	authMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/signin" || startsWith(r.URL.Path, "/signin") || startsWith(r.URL.Path, "/_app") {
				next.ServeHTTP(w, r)
				return
			}

			sessionToken := r.URL.Query().Get("session") // Check for token in URL parameters
			if sessionToken == "" {
				cookie, err := r.Cookie("session") // Check for token in cookies
				if err != nil {
					http.Redirect(w, r, "/signin", http.StatusTemporaryRedirect)
					return
				}
				sessionToken = cookie.Value // Use the Value field of the cookie
			}

			if !isValidSession(db, sessionToken) {
				http.Redirect(w, r, "/signin", http.StatusFound)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	fs := http.FileServer(http.Dir("./media"))
	http.Handle("/file/", authMiddleware(http.StripPrefix("/file", fs)))

	fs_seek := http.FileServer(http.Dir("./thumbnails"))
	http.Handle("/thumb/", authMiddleware(http.StripPrefix("/thumb", fs_seek)))

	// Set up the reverse proxy for all other requests
	targetURL, err := url.Parse(proxyTargetURL)
	if err != nil {
		log.Fatalf("Failed to parse target URL: %v", err)
	}

	proxy := httputil.NewSingleHostReverseProxy(targetURL)
	http.Handle("/", authMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Proxy request to the target server
		proxy.ServeHTTP(w, r)
	})))

	// Start the server on port 8080
	port := ":80"
	log.Printf("Server is listening on port %s...", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// isValidSession checks if the session token is valid by querying the database
func isValidSession(db *sql.DB, token string) bool {
	var exists bool
	// log.Printf("Checking session token: %s", token)
	query := `SELECT EXISTS (SELECT 1 FROM "Session" WHERE token = $1)`
	err := db.QueryRow(query, token).Scan(&exists)
	if err != nil {
		log.Printf("Database query error: %v", err)
		return false
	}
	return exists
}

// startsWith checks if the URL path starts with the specified prefix
func startsWith(path, prefix string) bool {
	return len(path) >= len(prefix) && path[:len(prefix)] == prefix
}
