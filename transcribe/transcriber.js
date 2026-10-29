const { getAllCharacterNames } = require('../characterStore');
const { getExistingNoteNames } = require('../summarise/obsidianSync');
const { obsidianPath } = require('../config.json');

async function transcribeAudio(wavPath) {
	try {
		const names = getAllCharacterNames();
		const obFileNames = getExistingNoteNames(obsidianPath);
		const obFileNamesArry = [...obFileNames];
        const response = await fetch('http://127.0.0.1:5005/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: wavPath, names, obFileNamesArry }),
        });
		const data = await response.json();
		if (data.error) {
			console.error('Transcription error:', data.error);
			return '';
		}
		return data.text || '';
	} catch (err) {
		console.error('Failed to reach transcription server:', err.message);
		return '';
	}
}

module.exports = { transcribeAudio };