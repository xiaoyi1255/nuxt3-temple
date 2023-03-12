import nodemailer from 'nodemailer';

export default defineEventHandler(async (context) => {
    const params = await readBody(context) || {}
    const transporter = nodemailer.createTransport({
        host: 'smtp.qq.com',
        port: 465, // SMTP 端口
        secure: true, // 使用 SSL
        secureConnection: true, // 使用 SSL
        auth: {
            user: "2489646826@qq.com",
            pass: 'hqvfqdwsupvbdiaj'
        }
    });
    const mailOptions = {
        from: '2489646826@qq.com', // 发件地址
        to: '1255274497@qq.com', // 收件列表
        subject: 'Hollo', // 标题
        html: '<b>Hello world ?</b>' // html 内容
    };

    mailOptions.html = getHtml(params)
    let resp = null
    const resObj = {
        code: 200,
        msg: '',
        data: {
            messageId: ''
        }
    }
    try {
        console.log('开始发送邮件')
        resp = await transporter.sendMail(mailOptions)
    } catch (error) {
        console.log('报错了', error)
        resObj.code = 10001
        resObj.msg = 'Submit Fail !'
    } finally {
        console.log('发送完成', resp)
        if (resp?.messageId) {
            resObj.msg = 'Submit Success !'
            resObj.data.messageId = resp.messageId
        }
        return resObj
    }
})

function getHtml(params: object) {
    let html = ""
    if (Object.keys(params).length) {
        const formNames = {
            "name": "姓名",
            "email": "邮箱",
            "messenger": "公司",
            "messengerAct": "手机",
            "txt": "留言",
        }
        for (let k in params) {
            html += `<p style="line-height: 48px;color: #666666;border-bottom: 1px solid #dddddd;">
                        <span style="color: #333333; width: 100px;">${formNames[k]}：</span>
                        ${params[k]}
                    </p>`
        }
    }
    return html
}
