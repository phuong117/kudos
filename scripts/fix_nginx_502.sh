#!/bin/bash

# Define paths
NGINX_CONF="/etc/nginx/nginx.conf"
SITE_CONF="/etc/nginx/sites-available/default"

echo "Applying ULTRA buffer settings directly to site configuration..."

# 1. Clean up global nginx.conf first to avoid confusion
sudo sed -i '/proxy_buffer_size/d' "$NGINX_CONF"
sudo sed -i '/proxy_buffers/d' "$NGINX_CONF"
sudo sed -i '/proxy_busy_buffers_size/d' "$NGINX_CONF"
sudo sed -i '/large_client_header_buffers/d' "$NGINX_CONF"
sudo sed -i '/proxy_read_timeout/d' "$NGINX_CONF"
sudo sed -i '/proxy_connect_timeout/d' "$NGINX_CONF"
sudo sed -i '/proxy_send_timeout/d' "$NGINX_CONF"

# 2. Update the site-specific configuration (more effective)
if [ -f "$SITE_CONF" ]; then
    echo "Updating $SITE_CONF..."
    # Backup
    sudo cp "$SITE_CONF" "${SITE_CONF}.bak"
    
    # Remove existing buffer settings in site conf if any
    sudo sed -i '/proxy_buffer_size/d' "$SITE_CONF"
    sudo sed -i '/proxy_buffers/d' "$SITE_CONF"
    sudo sed -i '/proxy_busy_buffers_size/d' "$SITE_CONF"
    sudo sed -i '/proxy_read_timeout/d' "$SITE_CONF"
    
    # Inject 1MB buffers and timeouts into the server block
    # We look for the first occurrence of 'server_name' and inject after it
    sudo sed -i '/server_name/a \    proxy_buffer_size   1024k;\n    proxy_buffers       8 1024k;\n    proxy_busy_buffers_size 1024k;\n    proxy_read_timeout 600;\n    proxy_connect_timeout 600;\n    proxy_send_timeout 600;' "$SITE_CONF"
else
    echo "Warning: $SITE_CONF not found. Falling back to nginx.conf"
    sudo sed -i '/http {/a \    proxy_buffer_size   1024k;\n    proxy_buffers       8 1024k;\n    proxy_busy_buffers_size 1024k;\n    large_client_header_buffers 4 128k;\n    proxy_read_timeout 600;' "$NGINX_CONF"
fi

# 3. Always ensure large headers are allowed in main http block
if ! grep -q "large_client_header_buffers" "$NGINX_CONF"; then
    sudo sed -i '/http {/a \    large_client_header_buffers 4 128k;' "$NGINX_CONF"
fi

# Test and reload
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "Configuration valid. Restarting Nginx..."
    sudo systemctl restart nginx
    echo "DONE. Nginx is now ready for huge headers."
else
    echo "Error detected! Restoring backups..."
    [ -f "${SITE_CONF}.bak" ] && sudo cp "${SITE_CONF}.bak" "$SITE_CONF"
    sudo systemctl restart nginx
fi
