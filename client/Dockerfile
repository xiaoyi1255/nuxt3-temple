# 基础镜像
FROM node:16.18.0

# 创建工作目录
WORKDIR /chat

# 复制 package.json 和 package-lock.json 到工作目录
COPY package*.json ./

# 安装依赖
RUN npm config set registry http://registry.npmmirror.com

RUN npm install --production

# 复制所有文件到工作目录
COPY . .

# 执行构建命令
RUN npm run build

# 容器对外暴露的端口
EXPOSE 80

# 启动命令
CMD ["npm", "start"]

