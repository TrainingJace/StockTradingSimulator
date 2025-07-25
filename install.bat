@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 Starting Stock Trading Simulator installation...
echo ================================

:: Check Node.js
echo 📋 Checking system requirements...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js (https://nodejs.org/)
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

:: Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found
    pause
    exit /b 1
) else (
    echo ✅ npm is installed
)

:: Check MySQL
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ MySQL not found. Skipping database creation step.
    echo    Please install MySQL manually and run database_setup.sql
    set MYSQL_AVAILABLE=false
) else (
    echo ✅ MySQL is installed
    set MYSQL_AVAILABLE=true
)

echo.

:: Install backend dependencies
echo 📦 Installing backend dependencies...
cd server
if not exist "package.json" (
    echo ❌ server/package.json not found
    pause
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo ❌ Backend dependency installation failed
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..

echo.

:: Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd client
if not exist "package.json" (
    echo ❌ client/package.json not found
    pause
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo ❌ Frontend dependency installation failed
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
cd ..

echo.

:: Configure environment file
echo ⚙️ Configuring environment file...
if not exist "server\.env" (
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
        echo ✅ server\.env file created
    ) else (
        (
            echo # Environment Configuration
            echo MODE=real
            echo PORT=3001
            echo.
            echo # Database Configuration
            echo DB_HOST=localhost
            echo DB_PORT=3306
            echo DB_NAME=stock_simulator
            echo DB_USER=root
            echo DB_PASS=
            echo.
            echo # JWT Configuration
            echo JWT_SECRET=your-super-secret-jwt-key
            echo.
            echo # API Keys ^(optional^)
            echo STOCK_API_KEY=your_api_key_here
            echo NEWS_API_KEY=your_news_api_key_here
        ) > server\.env
        echo ✅ Basic server\.env file created
    )
    
    echo ⚠️ Please edit the server\.env file and set your database password

    set /p db_password="Enter your MySQL root password (leave blank for no password): "

    :: Use PowerShell to update .env file
    powershell -Command "(Get-Content server\.env) -replace 'DB_PASS=.*', 'DB_PASS=!db_password!' | Set-Content server\.env"

    echo ✅ Database password set
) else (
    echo ✅ .env file already exists
)

echo.

:: Create database
if "!MYSQL_AVAILABLE!"=="true" (
    echo 🗄️ Setting up database...
    echo Creating database and tables...
    
    :: Read database config from .env file
    for /f "tokens=1,2 delims==" %%a in ('type server\.env ^| findstr "DB_"') do (
        if "%%a"=="DB_HOST" set DB_HOST=%%b
        if "%%a"=="DB_PORT" set DB_PORT=%%b
        if "%%a"=="DB_USER" set DB_USER=%%b
        if "%%a"=="DB_PASS" set DB_PASS=%%b
    )
    
    mysql -h!DB_HOST! -P!DB_PORT! -u!DB_USER! -p!DB_PASS! < database_setup.sql
    if errorlevel 1 (
        echo ❌ Database creation failed. Please check your database configuration.
        echo    You can run manually: mysql -u root -p < database_setup.sql
    ) else (
        echo ✅ Database created successfully
    )
) else (
    echo ⚠️ Skipping database setup (MySQL not installed)
    echo    Please install MySQL and run manually: mysql -u root -p < database_setup.sql
)

echo.

:: Create startup scripts
echo 📝 Creating startup scripts...

:: Create development startup script
(
    echo @echo off
    echo chcp 65001 ^>nul
    echo echo 🚀 Starting Stock Trading Simulator (Development Mode)
    echo echo ================================
    echo.
    echo echo 📡 Starting backend server...
    echo cd server
    echo start "Backend Server" cmd /k "set MODE=real && node app.js"
    echo cd ..
    echo.
    echo timeout /t 3 /nobreak ^>nul
    echo.
    echo echo 🌐 Starting frontend dev server...
    echo cd client
    echo start "Frontend Server" cmd /k "npm run dev"
    echo cd ..
    echo.
    echo echo.
    echo echo ✅ Services started!
    echo echo 🌐 Frontend: http://localhost:5174
    echo echo 📡 Backend:  http://localhost:3001
    echo echo.
    echo echo Press any key to exit...
    echo pause ^>nul
) > start-dev.bat

:: Create production startup script
(
    echo @echo off
    echo chcp 65001 ^>nul
    echo echo 🚀 Starting Stock Trading Simulator (Production Mode)
    echo echo ================================
    echo.
    echo echo 🔨 Building frontend app...
    echo cd client
    echo call npm run build
    echo cd ..
    echo.
    echo echo 📡 Starting backend server...
    echo cd server
    echo set MODE=real
    echo set NODE_ENV=production
    echo node app.js
    echo cd ..
    echo.
    echo pause
) > start-prod.bat

echo ✅ Startup scripts created
echo    - start-dev.bat  (Development Mode)
echo    - start-prod.bat (Production Mode)

pause
echo.

:: Show completion info
echo 🎉 Installation complete!
echo ================================
echo.
echo 📋 Next steps:
echo 1. If needed, edit server\.env to configure database connection
echo 2. Run start-dev.bat to start development environment
echo 3. Visit http://localhost:5174 to view the app
echo.
echo 🔗 Important links:
echo • Frontend dev server: http://localhost:5174
echo • Backend API server:  http://localhost:3001
echo • API docs:           http://localhost:3001/api
echo.
echo 📁 Project structure:
echo • client\     - Frontend React app
echo • server\     - Backend Node.js API
echo • database_setup.sql - Database initialization script
echo.
echo 💡 Tips:
echo • Use start-dev.bat to start development environment
echo • Use start-prod.bat to start production environment
echo • See README.md for more info
echo.

