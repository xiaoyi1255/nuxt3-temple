// const { Configuration, OpenAIApi } = require("openai");
const OpenAIApi  = require("openai");

const openai = new OpenAIApi({
	apiKey: ''
});
async function main() {
	const completion = await openai.chat.completions.create({
	  messages: [{ role: 'user', content: 'Say this is a test' }],
	  model: 'gpt-3.5-turbo',
	});
  
	console.log(completion.choices);
  }

  main()