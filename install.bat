@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 开始安装股票交易模拟器...
echo ================================

:: 检查Node.js
echo 📋 检查系统要求...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Node.js，请先安装 Node.js ^(https://nodejs.org/^)
    pause
    exit /b 1
) else (
    echo ✅ Node.js 已安装
)

:: 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 npm
    pause
    exit /b 1
) else (
    echo ✅ npm 已安装
)

:: 检查MySQL
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ 未找到 MySQL，将跳过数据库创建步骤
    echo    请手动安装 MySQL 并运行 database_setup.sql
    set MYSQL_AVAILABLE=false
) else (
    echo ✅ MySQL 已安装
    set MYSQL_AVAILABLE=true
)

echo.

:: 安装后端依赖
echo 📦 安装后端依赖...
cd server
if not exist "package.json" (
    echo ❌ 未找到 server/package.json
    pause
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)
echo ✅ 后端依赖安装完成
cd ..

echo.

:: 安装前端依赖
echo 📦 安装前端依赖...
cd client
if not exist "package.json" (
    echo ❌ 未找到 client/package.json
    pause
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)
echo ✅ 前端依赖安装完成
cd ..

echo.

:: 配置环境文件
echo ⚙️ 配置环境文件...
if not exist "server\.env" (
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
        echo ✅ 已创建 server\.env 文件
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
        echo ✅ 已创建基本的 server\.env 文件
    )
    
    echo ⚠️ 请编辑 server\.env 文件并设置您的数据库密码
    
    set /p db_password="请输入您的 MySQL root 密码 (留空表示无密码): "
    
    :: 使用 PowerShell 更新 .env 文件
    powershell -Command "(Get-Content server\.env) -replace 'DB_PASS=.*', 'DB_PASS=!db_password!' | Set-Content server\.env"
    
    echo ✅ 数据库密码已设置
) else (
    echo ✅ .env 文件已存在
)

echo.

:: 创建数据库
if "!MYSQL_AVAILABLE!"=="true" (
    echo 🗄️ 设置数据库...
    echo 正在创建数据库和表...
    
    :: 读取 .env 文件中的数据库配置
    for /f "tokens=1,2 delims==" %%a in ('type server\.env ^| findstr "DB_"') do (
        if "%%a"=="DB_HOST" set DB_HOST=%%b
        if "%%a"=="DB_PORT" set DB_PORT=%%b
        if "%%a"=="DB_USER" set DB_USER=%%b
        if "%%a"=="DB_PASS" set DB_PASS=%%b
    )
    
    mysql -h!DB_HOST! -P!DB_PORT! -u!DB_USER! -p!DB_PASS! < database_setup.sql
    if errorlevel 1 (
        echo ❌ 数据库创建失败，请检查您的数据库配置
        echo    您可以手动运行: mysql -u root -p < database_setup.sql
    ) else (
        echo ✅ 数据库创建成功
    )
) else (
    echo ⚠️ 跳过数据库设置 ^(MySQL 未安装^)
    echo    请安装 MySQL 后手动运行: mysql -u root -p < database_setup.sql
)

echo.

:: 创建启动脚本
echo 📝 创建启动脚本...

:: 创建开发环境启动脚本
(
    echo @echo off
    echo chcp 65001 ^>nul
    echo echo 🚀 启动股票交易模拟器 ^(开发模式^)
    echo echo ================================
    echo.
    echo echo 📡 启动后端服务器...
    echo cd server
    echo start "Backend Server" cmd /k "set MODE=real && node app.js"
    echo cd ..
    echo.
    echo timeout /t 3 /nobreak ^>nul
    echo.
    echo echo 🌐 启动前端开发服务器...
    echo cd client
    echo start "Frontend Server" cmd /k "npm run dev"
    echo cd ..
    echo.
    echo echo.
    echo echo ✅ 服务启动完成！
    echo echo 🌐 前端地址: http://localhost:5174
    echo echo 📡 后端地址: http://localhost:3001
    echo echo.
    echo echo 按任意键退出...
    echo pause ^>nul
) > start-dev.bat

:: 创建生产环境启动脚本
(
    echo @echo off
    echo chcp 65001 ^>nul
    echo echo 🚀 启动股票交易模拟器 ^(生产模式^)
    echo echo ================================
    echo.
    echo echo 🔨 构建前端应用...
    echo cd client
    echo call npm run build
    echo cd ..
    echo.
    echo echo 📡 启动后端服务器...
    echo cd server
    echo set MODE=real
    echo set NODE_ENV=production
    echo node app.js
    echo cd ..
    echo.
    echo pause
) > start-prod.bat

echo ✅ 启动脚本创建完成
echo    - start-dev.bat  ^(开发模式^)
echo    - start-prod.bat ^(生产模式^)

echo.

:: 显示完成信息
echo 🎉 安装完成！
echo ================================
echo.
echo 📋 下一步操作:
echo 1. 如果需要，请编辑 server\.env 文件配置数据库连接
echo 2. 运行 start-dev.bat 启动开发环境
echo 3. 访问 http://localhost:5174 查看应用
echo.
echo 🔗 重要链接:
echo • 前端开发服务器: http://localhost:5174
echo • 后端API服务器:  http://localhost:3001
echo • API文档:        http://localhost:3001/api
echo.
echo 📁 项目结构:
echo • client\     - 前端 React 应用
echo • server\     - 后端 Node.js API
echo • database_setup.sql - 数据库初始化脚本
echo.
echo 💡 提示:
echo • 使用 start-dev.bat 启动开发环境
echo • 使用 start-prod.bat 启动生产环境
echo • 查看 README.md 了解更多信息
echo.

pause
