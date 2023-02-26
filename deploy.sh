git add .
echo '--------------请输入commit 信息-------'
read msg
git commit -m "${msg}"
echo "您输入的commit 信息： ${msg}"
git push