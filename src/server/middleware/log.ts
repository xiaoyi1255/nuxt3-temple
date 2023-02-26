import { defineNodeMiddleware} from 'h3'

export default defineNodeMiddleware(e=>{
	console.log(e.req.url, '请求url');
})