# 🔧 Troubleshooting Guide

## Common Setup Issues and Solutions

### 1. Docker Desktop Not Running
**Error**: `Docker Desktop is not running!`

**Solutions**:
1. **Start Docker Desktop**: Look for the Docker whale icon in your system tray
2. **Wait for full startup**: The icon should be green (not orange/red)
3. **Run as Administrator**: Right-click PowerShell → "Run as Administrator"
4. **Restart Docker Desktop**: If it's stuck, restart it completely

### 2. Docker Build Failed
**Error**: `Failed to build Docker images`

**Solutions**:
1. **Check Docker status**: Make sure Docker Desktop is fully running
2. **Run as Administrator**: Always run the setup script as Administrator
3. **Enable Hyper-V**: 
   - Go to Windows Features
   - Enable "Hyper-V" and "Windows Hypervisor Platform"
   - Restart your computer
4. **Check Windows version**: Docker Desktop requires Windows 10 Pro/Enterprise or Windows 11

### 3. Environment Variables Not Set
**Error**: `The "SMTP_PASS" variable is not set`

**Solutions**:
1. **Update backend\.env**: Edit the file with your actual API keys
2. **Required variables**:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password_here
   JWT_SECRET=your_jwt_secret_here
   ```

### 4. Database Connection Failed
**Error**: `Failed to setup database`

**Solutions**:
1. **Wait longer**: Database needs time to start (30+ seconds)
2. **Check Docker containers**: Run `docker-compose ps` to see status
3. **Restart services**: Run `docker-compose restart`
4. **Check logs**: Run `docker-compose logs backend` for errors

### 5. Port Already in Use
**Error**: `Port 3000 is already in use`

**Solutions**:
1. **Stop other services**: Close any apps using port 3000
2. **Change ports**: Edit `docker-compose.yml` to use different ports
3. **Restart computer**: Sometimes Windows holds onto ports

### 6. Node.js Version Issues
**Error**: `Node.js version not supported`

**Solutions**:
1. **Update Node.js**: Download latest LTS from https://nodejs.org/
2. **Check version**: Run `node --version` (should be 18+)
3. **Restart terminal**: After installing Node.js

### 7. Git Not Found
**Error**: `Git is not installed`

**Solutions**:
1. **Install Git**: Download from https://git-scm.com/download/win
2. **Add to PATH**: Make sure Git is added to system PATH
3. **Restart terminal**: After installing Git

## Quick Fixes

### Reset Everything
```cmd
# Stop all services
docker-compose down

# Remove all containers and images
docker-compose down --rmi all --volumes --remove-orphans

# Run setup again
setup-windows.bat
```

### Check Service Status
```cmd
# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend
```

### Manual Database Setup
```cmd
# If automatic setup fails
docker-compose exec backend npx prisma db push
docker-compose exec backend npm run db:seed
```

## Still Having Issues?

1. **Check Windows version**: Docker Desktop requires Windows 10 Pro/Enterprise or Windows 11
2. **Enable virtualization**: Make sure virtualization is enabled in BIOS
3. **Check antivirus**: Some antivirus software blocks Docker
4. **Run Windows Update**: Make sure Windows is up to date
5. **Check disk space**: Docker needs at least 4GB free space

## Getting Help

If you're still stuck:
1. Check the logs: `docker-compose logs -f`
2. Take a screenshot of the error
3. Note your Windows version and Docker Desktop version
4. Check if you're running as Administrator

## Success Indicators

You'll know everything is working when:
- ✅ Docker Desktop shows green whale icon
- ✅ `docker-compose ps` shows all services as "Up"
- ✅ http://localhost:3000 loads the app
- ✅ http://localhost:3001/health returns "OK"
- ✅ You can create accounts and test the wizard


