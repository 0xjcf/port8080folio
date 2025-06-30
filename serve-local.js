#!/usr/bin/env node

/**
 * Local development server for port8080folio
 * Serves the site at http://localhost:8080/port8080folio/
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const BASE_PATH = '/port8080folio';

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.avif': 'image/avif'
};

const server = http.createServer((req, res) => {
    let filePath = req.url;

    // Remove base path if present
    if (filePath.startsWith(BASE_PATH)) {
        filePath = filePath.substring(BASE_PATH.length) || '/';
    } else if (filePath === '/') {
        // Redirect root to base path
        res.writeHead(301, { 'Location': `${BASE_PATH}/` });
        res.end();
        return;
    }

    // Default to index.html for directories
    if (filePath.endsWith('/')) {
        filePath += 'index.html';
    }

    // Remove leading slash for file path
    if (filePath.startsWith('/')) {
        filePath = filePath.substring(1);
    }

    const fullPath = path.join(process.cwd(), filePath);

    fs.readFile(fullPath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end(`Server error: ${error.code}`);
            }
        } else {
            const ext = path.extname(fullPath);
            const contentType = mimeTypes[ext] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Starting server at http://localhost:${PORT}${BASE_PATH}/`);
    console.log(`Serving files from: ${process.cwd()}`);
    console.log('Press Ctrl+C to stop the server');
}); 