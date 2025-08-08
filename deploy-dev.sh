#!/bin/bash

# Development deployment script for upworkdemo
# This script deploys the app to your server in development mode

SERVER_IP="168.231.115.219"
SERVER_USER="root"
APP_NAME="upworkdemo"
REMOTE_DIR="/var/www/$APP_NAME"
PORT="3003"

echo "🚀 Starting deployment to $SERVER_IP..."

# Create deployment package (excluding node_modules and .next)
echo "📦 Creating deployment package..."
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.env.local' \
    -czf deploy.tar.gz .

# Copy files to server
echo "📤 Uploading files to server..."
scp deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# Connect to server and deploy
echo "🔧 Setting up application on server..."
ssh $SERVER_USER@$SERVER_IP << EOF
    # Create app directory if it doesn't exist
    mkdir -p $REMOTE_DIR
    
    # Extract files
    cd $REMOTE_DIR
    tar -xzf /tmp/deploy.tar.gz
    rm /tmp/deploy.tar.gz
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install
    
    # Kill existing process if running
    pkill -f "next dev" || true
    
    # Start the development server in background
    echo "Starting development server on port $PORT..."
    nohup npm run dev > app.log 2>&1 &
    
    echo "✅ Deployment complete!"
    echo "🌐 App should be running at http://$SERVER_IP:$PORT"
    echo "📋 Check logs with: tail -f $REMOTE_DIR/app.log"
EOF

# Cleanup local deployment file
rm deploy.tar.gz

echo "🎉 Deployment finished!"
echo "🌐 Your app should be accessible at: http://$SERVER_IP:$PORT"
echo "📋 To check logs: ssh $SERVER_USER@$SERVER_IP 'tail -f $REMOTE_DIR/app.log'"