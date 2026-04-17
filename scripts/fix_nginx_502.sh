#!/bin/bash

# Configuration file path
NGINX_CONF="/etc/nginx/nginx.conf"

echo "Checking Nginx configuration for buffer settings..."

# Add settings to http block in nginx.conf if they don't exist
if ! grep -q "proxy_buffer_size" "$NGINX_CONF"; then
    echo "Adding buffer settings to /etc/nginx/nginx.conf..."
    sudo sed -i '/http {/a \    proxy_buffer_size   128k;\n    proxy_buffers       4 256k;\n    proxy_busy_buffers_size 256k;\n    large_client_header_buffers 4 32k;' "$NGINX_CONF"
else
    echo "Buffer settings already exist in nginx.conf."
fi

# Test and reload
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "Configuration valid. Restarting Nginx..."
    sudo systemctl restart nginx
    echo "Nginx restarted successfully. Please try logging in again."
else
    echo "Error in Nginx configuration. Please check manually."
fi
