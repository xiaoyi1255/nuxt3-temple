echo "先拉一下代码"
git pull
cd client
yarn 
yarn generate
rm -rf /www/wwwroot/chat-client/*
cp ./dist/* /www/wwwroot/chat-client/ 
echo "chat ui 复制完毕"

cd ../express
yarn
yarn stop
yarn deploy
echo "后端项目跑起来了"

