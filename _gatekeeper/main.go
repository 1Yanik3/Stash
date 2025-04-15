package main

import (
	"database/sql"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/gorilla/websocket"
	_ "github.com/jackc/pgx/v4/stdlib" // PostgreSQL driver
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // In production, you may want stricter origin checks.
}

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
			if r.URL.Path == "/signin" || r.URL.Path == "/manifest.json" || r.URL.Path == "/worker.js" || startsWith(r.URL.Path, "/signin") || startsWith(r.URL.Path, "/_app") || startsWith(r.URL.Path, "/icons/") {
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

	// WebSocket handler
	http.HandleFunc("/ws/", func(w http.ResponseWriter, r *http.Request) {
		// Extract target IP and port from the URL path
		pathParts := strings.Split(r.URL.Path, "/")
		if len(pathParts) < 4 {
			http.Error(w, "Invalid WebSocket target format. Must be /ws/<ip>/<port>", http.StatusBadRequest)
			return
		}

		targetIP := pathParts[2]
		targetPort := pathParts[3]

		targetURL := "ws://" + targetIP + ":" + targetPort + "/"
		proxyWebSocket(w, r, targetURL)
	})

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

// proxyWebSocket handles the WebSocket proxying between the client and the target server
func proxyWebSocket(w http.ResponseWriter, r *http.Request, targetURL string) {
	// Upgrade the client connection to WebSocket
	clientConn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade WebSocket", http.StatusInternalServerError)
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer clientConn.Close()

	// Dial the target WebSocket server
	targetConn, _, err := websocket.DefaultDialer.Dial(targetURL, nil)
	if err != nil {
		http.Error(w, "Failed to connect to target WebSocket", http.StatusBadGateway)
		log.Printf("WebSocket dial error: %v", err)
		return
	}
	defer targetConn.Close()

	// Proxy data between client and target server
	errChan := make(chan error, 2)

	go copyWebSocketData(clientConn, targetConn, errChan)
	go copyWebSocketData(targetConn, clientConn, errChan)

	// Wait for any error from either direction
	if err := <-errChan; err != nil {
		log.Printf("WebSocket proxy error: %v", err)
	}
}

// copyWebSocketData copies data between two WebSocket connections
func copyWebSocketData(src, dst *websocket.Conn, errChan chan error) {
	for {
		messageType, message, err := src.ReadMessage()
		if err != nil {
			errChan <- err
			return
		}

		if err := dst.WriteMessage(messageType, message); err != nil {
			errChan <- err
			return
		}
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
