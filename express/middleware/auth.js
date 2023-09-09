const jwt = require('jsonwebtoken');
const { SERET_KEY } = require('./../config');

/**
 * 校验token 是否有效
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const auth = async (req, res, next) => {
	try {
		const token = req.headers?.authorization;
		token &&
			jwt.verify(token, SERET_KEY, (err, data) => {
				if (err) {
					res.send({
						code: 401,
						msg: 'token 过期，或失效'
					});
					return;
				}
				next();
        return
			});
      sendErr()
	} catch (error) {
    sendErr
	}
  function sendErr(){
		res.send({
			code: 401,
			msg: 'token 过期，或失效'
		});
  }
};

// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InhpYW95aSIsImlkIjoiMmQxZDhkMzctZWE0Mi00MDg3LTk3MWQtNmRmZTU1MThiYjMzIiwiaWF0IjoxNjk0MjQ0NjAwLCJleHAiOjE2OTQyNDgyMDB9.L4kEfrQBCalxotPVFrNn4QyHIFDc-LRJOpqHvB9-5EE"

// const verify = () => {
//   jwt.verify(token, SERET_KEY, (err, data) => {
//     console.log(JSON.stringify(data))
//   })
// }
// verify()

module.exports = {
	auth
};
