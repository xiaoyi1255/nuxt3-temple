# 使用 Node.js 作为基础镜像
FROM node:18

# 创建工作目录
WORKDIR /app

# 将应用的 package.json 和 package-lock.json 复制到容器中
COPY package*.json ./

# 安装应用的依赖
RUN npm install

# 复制应用代码到容器中
COPY . .

# 使用 PM2 启动应用
CMD ["npm", "deploy"] # 替换为你的应用入口文件
