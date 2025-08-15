# (Helper script for different APIs)
#!/bin/bash

PORT=${1:-3001}
API_URL=${2:-"REACT_APP_API_URL"}

echo "Starting app on port $PORT with API: $API_URL"

PORT=$PORT API_URL=$API_URL docker-compose up --build