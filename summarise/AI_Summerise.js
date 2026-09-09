const { askChatGPT } = require('./openaiClient');
const { obsidianPath } = require('../config.json');
const { syncObsidianEntities } = require('./obsidianSync');

const fs = require('node:fs');
const path = require('node:path');

async function summeriseAi(prompt, sessionName) {

    const basePromt = `You are summarizing a Dungeons & Dragons session transcript for an Obsidian vault. 
    Your summary will be saved as a session note and cross-linked with other notes about 
    characters, locations, and items in the campaign.

    Read the full transcript below and produce a structured summary with these sections:

    ## Session Summary
    An overview of what happened this session, in narrative order.

    ## Key Events
    A bulleted list of the significant plot moments, decisions, fights, or discoveries — 
    skip small talk, rules discussion, and out-of-character chatter. Focus on things that 
    would matter to someone catching up on the campaign later.

    ## Characters Involved
    List every player character and significant NPC who appeared or was mentioned, each 
    formatted as [[Character Name]]. Include a short note on what they did or how they're 
    relevant this session.

    ## Locations
    List every place visited or referenced, each formatted as [[Location Name]], with a 
    one-line note on what happened there.

    ## Items & Loot
    List any notable items, weapons, artifacts, or treasure gained, found, used, or 
    discussed, each formatted as [[Item Name]]. Skip mundane/inventory items unless they 
    became plot-relevant.

    ## Open Threads
    Anything left unresolved — a quest hook, a promise made, a mystery introduced, a 
    decision the party still needs to make. This section helps the group remember what to 
    pick up next session.

    Formatting rules:
    - Use [[double brackets]] around every proper noun that names a character, location, or 
    item, even on repeat mentions, so Obsidian links them consistently.
    - Keep bullet points concise — one line each where possible.
    - Do not include out-of-character banter, rules lookups, or scheduling discussion.
    - If a name is misspelled or garbled in the transcript (this was auto-transcribed and 
    may contain errors), use your best judgment on the intended name based on context, and 
    note it in parentheses only if genuinely ambiguous.

    Transcript:
    `;

    const fullPromt = basePromt + prompt;

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


module.exports = { summeriseAi };