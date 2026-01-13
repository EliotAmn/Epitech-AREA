#!/bin/sh
set -e

# Default value if not provided
VITE_API_URL=${VITE_API_URL:-http://localhost:8080}

echo "Configuring frontend with API URL: $VITE_API_URL"

# Find and replace the default API URL with the runtime one in all JS files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:8080|${VITE_API_URL}|g" {} \;

echo "Configuration complete. Starting nginx..."

# Start nginx
exec nginx -g "daemon off;"

