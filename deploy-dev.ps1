# PowerShell deployment script for upworkdemo
# This script deploys the app to your server in development mode

$SERVER_IP = "168.231.115.219"
$SERVER_USER = "root"
$APP_NAME = "upworkdemo"
$REMOTE_DIR = "/var/www/$APP_NAME"
$PORT = "3003"

Write-Host "🚀 Starting deployment to $SERVER_IP..." -ForegroundColor Green

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$excludeItems = @("node_modules", ".next", ".git", "*.log", ".env.local")
$tempDir = "$env:TEMP\upworkdemo-deploy"
$deployZip = "$env:TEMP\deploy.zip"

# Remove old temp files
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
if (Test-Path $deployZip) { Remove-Item $deployZip -Force }

# Copy files excluding certain directories
robocopy . $tempDir /E /XD node_modules .next .git /XF *.log .env.local /NFL /NDL /NJH /NJS

# Create zip file
Compress-Archive -Path "$tempDir\*" -DestinationPath $deployZip

# Upload to server
Write-Host "📤 Uploading files to server..." -ForegroundColor Yellow
scp $deployZip "${SERVER_USER}@${SERVER_IP}:/tmp/deploy.zip"

# Deploy on server
Write-Host "🔧 Setting up application on server..." -ForegroundColor Yellow
$sshCommands = @"
# Create app directory
mkdir -p $REMOTE_DIR

# Extract files
cd $REMOTE_DIR
unzip -o /tmp/deploy.zip
rm /tmp/deploy.zip

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Kill existing process
pkill -f "next dev" || true

# Start development server
echo "Starting development server on port $PORT..."
nohup npm run dev > app.log 2>&1 &

echo "✅ Deployment complete!"
echo "🌐 App running at http://$SERVER_IP:$PORT"
"@

ssh "${SERVER_USER}@${SERVER_IP}" $sshCommands

# Cleanup
Remove-Item $tempDir -Recurse -Force
Remove-Item $deployZip -Force

Write-Host "🎉 Deployment finished!" -ForegroundColor Green
Write-Host "🌐 Your app should be accessible at: http://$SERVER_IP:$PORT" -ForegroundColor Cyan
Write-Host "📋 To check logs: ssh $SERVER_USER@$SERVER_IP 'tail -f $REMOTE_DIR/app.log'" -ForegroundColor Yellow