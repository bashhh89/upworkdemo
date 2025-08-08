# Development Deployment Guide

## Quick Deploy (Automated)

### Option 1: PowerShell (Windows)
```powershell
cd upworkdemo
.\deploy-dev.ps1
```

### Option 2: Bash (if you have WSL or Git Bash)
```bash
cd upworkdemo
chmod +x deploy-dev.sh
./deploy-dev.sh
```

## Manual Deployment Steps

1. **Connect to your server:**
   ```bash
   ssh root@168.231.115.219
   ```

2. **Prepare the server:**
   ```bash
   # Install Node.js (if not installed)
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt-get install -y nodejs
   
   # Create app directory
   mkdir -p /var/www/upworkdemo
   cd /var/www/upworkdemo
   ```

3. **Upload your code:**
   From your local machine:
   ```bash
   # Create a zip without node_modules
   tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf upworkdemo.tar.gz .
   scp upworkdemo.tar.gz root@168.231.115.219:/var/www/upworkdemo/
   ```

4. **On the server, extract and run:**
   ```bash
   cd /var/www/upworkdemo
   tar -xzf upworkdemo.tar.gz
   rm upworkdemo.tar.gz
   
   # Install dependencies
   npm install
   
   # Start in development mode
   npm run dev
   ```

## Access Your App

- **URL:** http://168.231.115.219:3003
- **Port:** 3003 (as configured in package.json)

## Managing the Process

### Start in background:
```bash
nohup npm run dev > app.log 2>&1 &
```

### Check if running:
```bash
ps aux | grep "next dev"
```

### View logs:
```bash
tail -f /var/www/upworkdemo/app.log
```

### Stop the process:
```bash
pkill -f "next dev"
```

## Firewall Configuration

Make sure port 3003 is open:
```bash
# For UFW
ufw allow 3003

# For iptables
iptables -A INPUT -p tcp --dport 3003 -j ACCEPT
```

## Environment Variables

If you need environment variables, create a `.env.local` file in the project root on the server:
```bash
cd /var/www/upworkdemo
nano .env.local
```

Add your variables:
```
NEXT_PUBLIC_API_URL=http://168.231.115.219:3003
# Add other environment variables as needed
```