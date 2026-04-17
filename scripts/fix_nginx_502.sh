#!/bin/bash

# Configuration file path
NGINX_CONF="/etc/nginx/nginx.conf"

echo "Applying MAXIMUM buffer and timeout settings to Nginx..."

# Backup original config
sudo cp "$NGINX_CONF" "${NGINX_CONF}.bak"

# Clean up any previous attempts
sudo sed -i '/proxy_buffer_size/d' "$NGINX_CONF"
sudo sed -i '/proxy_buffers/d' "$NGINX_CONF"
sudo sed -i '/proxy_busy_buffers_size/d' "$NGINX_CONF"
sudo sed -i '/large_client_header_buffers/d' "$NGINX_CONF"
sudo sed -i '/proxy_read_timeout/d' "$NGINX_CONF"
sudo sed -i '/proxy_connect_timeout/d' "$NGINX_CONF"
sudo sed -i '/proxy_send_timeout/d' "$NGINX_CONF"

# Add new settings to http block
# - Buffers: Handling massive tokens
# - Timeouts: Allowing app enough time to process the large payload
sudo sed -i '/http {/a \    proxy_buffer_size   512k;\n    proxy_buffers       4 512k;\n    proxy_busy_buffers_size 512k;\n    large_client_header_buffers 4 64k;\n    proxy_read_timeout 300;\n    proxy_connect_timeout 300;\n    proxy_send_timeout 300;' "$NGINX_CONF"

# Test and reload
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "Configuration valid. Restarting Nginx..."
    sudo systemctl restart nginx
    echo "Nginx restarted successfully."
    echo ""
    echo "Next steps on VM:"
    echo "1. git pull origin main"
    echo "2. sudo docker compose up -d --build"
    echo "3. Try logging in again."
else
    echo "Error in Nginx configuration. Restoring backup..."
    sudo cp "${NGINX_CONF}.bak" "$NGINX_CONF"
    sudo systemctl restart nginx
fi
