#!/usr/bin/env python3
"""
Local development server for port8080folio
Serves the site at http://localhost:8080/port8080folio/
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse

PORT = 8080
BASE_PATH = "/port8080folio"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Remove the base path if present
        if path.startswith(BASE_PATH):
            path = path[len(BASE_PATH):]
            if not path:
                path = "/"
            
            # Update the path
            self.path = path
        elif path == "/":
            # Redirect root to base path
            self.send_response(301)
            self.send_header('Location', f'{BASE_PATH}/')
            self.end_headers()
            return
        
        # Serve the file
        return super().do_GET()
    
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

print(f"Starting server at http://localhost:{PORT}{BASE_PATH}/")
print(f"Serving files from: {os.getcwd()}")
print("Press Ctrl+C to stop the server")

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0) 