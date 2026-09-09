const OpenAI = require('openai');
const { ApiKey} = require('../config.json');
const client = new OpenAI({ apiKey: ApiKey });

async function askChatGPT(prompt) {
	const response = await client.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [{ role: 'user', content: prompt }],
	});

    return response.choices[0].message.content;
}

module.exports = { askChatGPT };