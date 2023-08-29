// const { Configuration, OpenAIApi } = require("openai");
const OpenAIApi  = require("openai");

const openai = new OpenAIApi({
	apiKey: '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'
});
async function main() {
	const completion = await openai.chat.completions.create({
	  messages: [{ role: 'user', content: 'Say this is a test' }],
	  model: 'gpt-3.5-turbo',
	});
  
	console.log(completion.choices);
  }

  main()