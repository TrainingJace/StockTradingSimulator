@echo off

REM Stock Trading Simulator - One-click Installation Script

setlocal enabledelayedexpansion

REM Color definitions
set "RED=\033[0;31m"
set "GREEN=\033[0;32m"
set "YELLOW=\033[1;33m"
set "BLUE=\033[0;34m"
set "NC=\033[0m" REM No Color

REM Check if the necessary tools are installed
:check_requirements
    echo !BLUE!📋 Checking system requirements...!NC!

    REM Check Node.js
    where node >nul 2>nul
    if errorlevel 1 (
        echo !RED!❌ Node.js not found, please install Node.js (https://nodejs.org/)!NC!
        exit /b 1
    ) else (
        for /f "tokens=*" %%i in ('node --version') do set "NODE_VERSION=%%i"
        echo !GREEN!✅ Node.js version: !NODE_VERSION!!NC!
    )

    REM Check npm
    where npm >nul 2>nul
    if errorlevel 1 (
        echo !RED!❌ npm not found!NC!
        exit /b 1
    ) else (
        for /f "tokens=*" %%i in ('npm --version') do set "NPM_VERSION=%%i"
        echo !GREEN!✅ npm version: !NPM_VERSION!!NC!
    )

    REM Check MySQL
    set "MYSQL_PATH="
    where mysql >nul 2>nul
    if errorlevel 0 (
        set "MYSQL_PATH=mysql"
    ) else (
        if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
            set "MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
        )
    )

    if "!MYSQL_PATH!"=="" (
        echo !YELLOW!⚠️  MySQL not found, skipping database creation step!NC!
        echo !YELLOW!   Please ensure MySQL is installed and running!NC!
        set "MYSQL_AVAILABLE=false"
    ) else (
        for /f "tokens=*" %%i in ('"!MYSQL_PATH!" --version') do set "MYSQL_VERSION=%%i"
        echo !GREEN!✅ MySQL version: !MYSQL_VERSION!!NC!
        set "MYSQL_AVAILABLE=true"
    )

    echo.
    goto :eof

REM Install backend dependencies
:install_backend
    echo !BLUE!📦 Installing backend dependencies...!NC!
    pushd server

    if not exist "package.json" (
        echo !RED!❌ server/package.json not found!NC!
        exit /b 1
    )

    npm install
    echo !GREEN!✅ Backend dependencies installed successfully!NC!
    popd
    echo.
    goto :eof

REM Install frontend dependencies
:install_frontend
    echo !BLUE!📦 Installing frontend dependencies...!NC!
    pushd client

    if not exist "package.json" (
        echo !RED!❌ client/package.json not found!NC!
        exit /b 1
    )

    npm install
    echo !GREEN!✅ Frontend dependencies installed successfully!NC!
    popd
    echo.
    goto :eof

REM Configure environment file
:setup_environment
    echo !BLUE!⚙️  Configuring environment file...!NC!

    if not exist "server\.env" (
        if exist "server\.env.example" (
            copy "server\.env.example" "server\.env"
            echo !GREEN!✅ server\.env file created!NC!
        ) else (
            echo MODE=real > "server\.env"
            echo PORT=3001 >> "server\.env"
            echo DB_HOST=localhost >> "server\.env"
            echo DB_PORT=3306 >> "server\.env"
            echo DB_NAME=stock_simulator >> "server\.env"
            echo DB_USER=root >> "server\.env"
            echo DB_PASS= >> "server\.env"
            echo JWT_SECRET=your-super-secret-jwt-key-%date%-%time% >> "server\.env"
            echo STOCK_API_KEY=your_api_key_here >> "server\.env"
            echo NEWS_API_KEY=your_news_api_key_here >> "server\.env"
            echo !GREEN!✅ Basic server\.env file created!NC!
        )

        echo !BLUE!Enter your MySQL root password (leave blank for no password):!NC!
        set /p "root_password="

        powershell -Command "(gc 'server\.env') -replace 'DB_PASS=.*', 'DB_PASS=!root_password!' | sc 'server\.env'"
        echo !GREEN!✅ Database password set successfully!NC!
    ) else (
        echo !GREEN!✅ .env file already exists!NC!
    )
    echo.
    goto :eof

REM Database setup instructions
:setup_database
    echo !BLUE!🗄️  Database setup instructions...!NC!
    echo !GREEN!✅ Database will be automatically created when the application starts!NC!
    echo !BLUE!   - The application will automatically create the database 'stock_simulator'!NC!
    echo !BLUE!   - Required table structures will be automatically created!NC!
    echo !BLUE!   - No need to manually run SQL scripts!NC!

    if "!MYSQL_AVAILABLE!"=="true" (
        echo !GREEN!✅ MySQL is available, database is ready!NC!
    ) else (
        echo !YELLOW!⚠️  Please ensure MySQL service is running!NC!
        echo !YELLOW!   The application needs to connect to the MySQL server when starting!NC!
    )
    echo.
    goto :eof

REM Display completion information
:show_completion_info
    echo !GREEN!🎉 Installation complete!NC!
    echo ========================================
    echo.
    echo !BLUE!📋 Next steps:!NC!
    echo 1. Run start-dev.bat to start the development environment
    echo 2. Visit http://localhost:5174 to view the application
    echo 3. Database has been configured, connect using the root user
    echo.
    echo !BLUE!🔗 Important links:!NC!
    echo • Frontend development server: http://localhost:5174
    echo • Backend API server:  http://localhost:3001
    echo • API documentation:        http://localhost:3001/api
    echo.
    echo !BLUE!📁 Project structure:!NC!
    echo • client/     - Frontend React application
    echo • server/     - Backend Node.js API
    echo • database_setup.sql - Database initialization script
    echo.
    echo !YELLOW!💡 Tips:!NC!
    echo • Use start-dev.bat to start the development environment
    echo • Use start-prod.bat to start the production environment
    echo • Database tables will be automatically created, no need to manually run SQL scripts
    echo • Refer to README.md for more information
    echo.
    goto :eof

REM Main installation process
:main
    echo !BLUE!🏗️  Stock Trading Simulator - One-click Installation Script!NC!
    echo ========================================
    echo.

    call :check_requirements
    call :install_backend
    call :install_frontend
    call :setup_environment
    call :setup_database
    call :show_completion_info
    goto :eof

call :main
