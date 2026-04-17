#!/bin/bash

# Configuration file path
NGINX_CONF="/etc/nginx/nginx.conf"

echo "Applying AGGRESSIVE buffer settings to Nginx..."

# Backup original config
sudo cp "$NGINX_CONF" "${NGINX_CONF}.bak"

# Clean up any previous attempts to avoid duplication
sudo sed -i '/proxy_buffer_size/d' "$NGINX_CONF"
sudo sed -i '/proxy_buffers/d' "$NGINX_CONF"
sudo sed -i '/proxy_busy_buffers_size/d' "$NGINX_CONF"
sudo sed -i '/large_client_header_buffers/d' "$NGINX_CONF"

# Add new settings to http block
# These settings will handle extremely long Microsoft SSO tokens
sudo sed -i '/http {/a \    proxy_buffer_size   256k;\n    proxy_buffers       4 512k;\n    proxy_busy_buffers_size 512k;\n    large_client_header_buffers 4 64k;' "$NGINX_CONF"

# Test and reload
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "Configuration valid. Restarting Nginx..."
    sudo systemctl restart nginx
    echo "Nginx restarted successfully."
    echo "IMPORTANT: Now you MUST rebuild your Docker containers to apply Node.js header limits:"
    echo "sudo docker compose up -d --build"
else
    echo "Error in Nginx configuration. Restoring backup..."
    sudo cp "${NGINX_CONF}.bak" "$NGINX_CONF"
    sudo systemctl restart nginx
fi
