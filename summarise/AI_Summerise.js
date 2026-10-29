const { askChatGPT } = require('./openaiClient');
const { obsidianPath } = require('../config.json');
const { syncObsidianEntities } = require('./obsidianSync');

const fs = require('node:fs');
const path = require('node:path');

const { basePrompt, basePromptOby } = require('./basePrompts');


const summaryPath = path.join(__dirname, '../summaries');


async function summeriseAi(prompt, sessionName) {
    const fullPromt = basePrompt + prompt;
    const summary = await askChatGPT(fullPromt);

    const session = path.parse(sessionName).name + '.txt';
    const outputPath = path.join(summaryPath, session);

    fs.mkdirSync(summaryPath, { recursive: true });
    fs.writeFileSync(outputPath, summary, 'utf8');

    return outputPath;
}

async function summeriseAiObsidian(prompt, sessionName) {

    const fullPromt = basePromptOby + prompt;

    const summary = await askChatGPT(fullPromt);
    const session = path.parse(sessionName).name + ".md";
    const outputPath = path.join(obsidianPath, session);
    fs.writeFileSync(outputPath, summary);

    const newNotes = await syncObsidianEntities(
        obsidianPath,
        summary,
        prompt,
        { characters: 'New_Characters', locations: 'New_Locations', items: 'New_items' } // adjust to match your actual vault's folder names
    );

    const newNotesMsg = newNotes.length
        ? `\nCreated ${newNotes.length} new note(s): ${newNotes.map((n) => n.name).join(', ')}`
        : '\nNo new characters, locations, or items to add.';

    return `Summary saved to \`${outputPath}\`\n${newNotesMsg}`;
}

module.exports = { summeriseAi, summeriseAiObsidian };