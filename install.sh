#!/bin/bash

# 股票交易模拟器 - 一键安装和设置脚本
# Stock Trading Simulator - One-click Installation Script

set -e  # 遇到错误就退出

echo "🚀 开始安装股票交易模拟器..."
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否安装了必要的工具
check_requirements() {
    echo -e "${BLUE}📋 检查系统要求...${NC}"
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ 未找到 Node.js，请先安装 Node.js (https://nodejs.org/)${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Node.js 版本: $(node --version)${NC}"
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ 未找到 npm${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ npm 版本: $(npm --version)${NC}"
    fi
    
    # 检查 MySQL
    MYSQL_PATH=""
    if command -v mysql &> /dev/null; then
        MYSQL_PATH="mysql"
    elif [ -f "/usr/local/mysql/bin/mysql" ]; then
        MYSQL_PATH="/usr/local/mysql/bin/mysql"
        # 添加到当前会话的 PATH
        export PATH="/usr/local/mysql/bin:$PATH"
    elif [ -f "/opt/homebrew/bin/mysql" ]; then
        MYSQL_PATH="/opt/homebrew/bin/mysql"
    fi
    
    if [ -z "$MYSQL_PATH" ]; then
        echo -e "${YELLOW}⚠️  未找到 MySQL，将跳过数据库创建步骤${NC}"
        echo -e "${YELLOW}   请确保 MySQL 已安装并正在运行${NC}"
        MYSQL_AVAILABLE=false
    else
        echo -e "${GREEN}✅ MySQL 版本: $($MYSQL_PATH --version)${NC}"
        MYSQL_AVAILABLE=true
    fi
    
    echo ""
}

# 安装后端依赖
install_backend() {
    echo -e "${BLUE}📦 安装后端依赖...${NC}"
    cd server
    
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ 未找到 server/package.json${NC}"
        exit 1
    fi
    
    npm install
    echo -e "${GREEN}✅ 后端依赖安装完成${NC}"
    cd ..
    echo ""
}

# 安装前端依赖
install_frontend() {
    echo -e "${BLUE}📦 安装前端依赖...${NC}"
    cd client
    
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ 未找到 client/package.json${NC}"
        exit 1
    fi
    
    npm install
    echo -e "${GREEN}✅ 前端依赖安装完成${NC}"
    cd ..
    echo ""
}

# 配置环境文件
setup_environment() {
    echo -e "${BLUE}⚙️  配置环境文件...${NC}"
    
    # 检查是否存在 .env 文件
    if [ ! -f "server/.env" ]; then
        if [ -f "server/.env.example" ]; then
            cp server/.env.example server/.env
            echo -e "${GREEN}✅ 已创建 server/.env 文件${NC}"
        else
            # 创建基本的 .env 文件
            cat > server/.env << EOF
# Environment Configuration
MODE=real
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stock_simulator
DB_USER=root
DB_PASS=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-$(date +%s)

# API Keys (optional)
STOCK_API_KEY=your_api_key_here
NEWS_API_KEY=your_news_api_key_here
EOF
            echo -e "${GREEN}✅ 已创建基本的 server/.env 文件${NC}"
        fi
        
        # 提示用户输入数据库密码
        echo -e "${BLUE}请输入您的 MySQL root 密码 (留空表示无密码):${NC}"
        read -s root_password
        
        # 更新 .env 文件中的数据库密码
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/DB_PASS=.*/DB_PASS=$root_password/" server/.env
        else
            # Linux
            sed -i "s/DB_PASS=.*/DB_PASS=$root_password/" server/.env
        fi
        
        echo -e "${GREEN}✅ 数据库密码已设置${NC}"
    else
        echo -e "${GREEN}✅ .env 文件已存在${NC}"
    fi
    echo ""
}

# 数据库设置说明
setup_database() {
    echo -e "${BLUE}🗄️  数据库设置说明...${NC}"
    echo -e "${GREEN}✅ 数据库会在应用启动时自动创建${NC}"
    echo -e "${BLUE}   - 应用会自动创建数据库 '${DB_NAME:-stock_simulator}'${NC}"
    echo -e "${BLUE}   - 会自动创建所需的表结构${NC}"
    echo -e "${BLUE}   - 无需手动运行SQL脚本${NC}"
    
    if [ "$MYSQL_AVAILABLE" = true ]; then
        echo -e "${GREEN}✅ MySQL 可用，数据库准备就绪${NC}"
    else
        echo -e "${YELLOW}⚠️  请确保 MySQL 服务正在运行${NC}"
        echo -e "${YELLOW}   应用启动时需要连接到 MySQL 服务器${NC}"
    fi
    echo ""
}

# 创建启动脚本
create_start_scripts() {
    echo -e "${BLUE}📝 创建启动脚本...${NC}"
    
    # 创建开发环境启动脚本
    cat > start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 启动股票交易模拟器 (开发模式)"
echo "================================"

# 启动后端服务器
echo "📡 启动后端服务器..."
cd server
MODE=real node app.js &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端开发服务器
echo "🌐 启动前端开发服务器..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务启动完成！"
echo "🌐 前端地址: http://localhost:5174"
echo "📡 后端地址: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
EOF

    # 创建生产环境启动脚本
    cat > start-prod.sh << 'EOF'
#!/bin/bash

echo "🚀 启动股票交易模拟器 (生产模式)"
echo "================================"

# 构建前端
echo "🔨 构建前端应用..."
cd client
npm run build
cd ..

# 启动后端服务器
echo "📡 启动后端服务器..."
cd server
MODE=real NODE_ENV=production node app.js
EOF

    # 设置执行权限
    chmod +x start-dev.sh
    chmod +x start-prod.sh
    
    echo -e "${GREEN}✅ 启动脚本创建完成${NC}"
    echo "   - start-dev.sh  (开发模式)"
    echo "   - start-prod.sh (生产模式)"
    echo ""
}

# 显示完成信息
show_completion_info() {
    echo -e "${GREEN}🎉 安装完成！${NC}"
    echo "================================"
    echo ""
    echo -e "${BLUE}📋 下一步操作:${NC}"
    echo "1. 运行 ./start-dev.sh 启动开发环境"
    echo "2. 访问 http://localhost:5174 查看应用"
    echo "3. 数据库已配置完成，使用 root 用户连接"
    echo ""
    echo -e "${BLUE}🔗 重要链接:${NC}"
    echo "• 前端开发服务器: http://localhost:5174"
    echo "• 后端API服务器:  http://localhost:3001"
    echo "• API文档:        http://localhost:3001/api"
    echo ""
    echo -e "${BLUE}📁 项目结构:${NC}"
    echo "• client/     - 前端 React 应用"
    echo "• server/     - 后端 Node.js API"
    echo "• database_setup.sql - 数据库初始化脚本"
    echo ""
    echo -e "${YELLOW}💡 提示:${NC}"
    echo "• 使用 ./start-dev.sh 启动开发环境"
    echo "• 使用 ./start-prod.sh 启动生产环境"
    echo "• 数据库表会自动创建，无需手动运行 SQL 脚本"
    echo "• 查看 README.md 了解更多信息"
    echo ""
}

# 主安装流程
main() {
    echo -e "${BLUE}🏗️  股票交易模拟器 - 一键安装脚本${NC}"
    echo "========================================"
    echo ""
    
    check_requirements
    install_backend
    install_frontend
    setup_environment
    setup_database
    create_start_scripts
    show_completion_info
}

# 运行主函数
main "$@"
