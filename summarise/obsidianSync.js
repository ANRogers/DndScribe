const fs = require('node:fs');
const path = require('node:path');
const { askChatGPT } = require('./openaiClient');

// Recursively collects every existing note's filename (without .md), lowercase,
// so a vault organized into subfolders (Characters/, Locations/, etc.) still works.
function getExistingNoteNames(vaultPath) {
	const names = new Set();

	function walk(dir) {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
			} else if (entry.isFile() && entry.name.endsWith('.md')) {
				names.add(entry.name.slice(0, -3).toLowerCase());
			}
		}
	}

	walk(vaultPath);
	return names;
}

// Pulls the text of one section out of the summary, e.g. everything under
// "## Characters Involved" until the next "## " heading.
function extractSection(summaryText, headerName) {
	const regex = new RegExp(`## ${headerName}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
	const match = summaryText.match(regex);
	return match ? match[1] : '';
}

// Pulls just the TITLE from each bullet in a section — e.g.
// "* [[Allomodium]]: A resource discussed for crafting" -> "Allomodium"
// Only checks for [[brackets]] in the part BEFORE the colon, so any
// [[other names]] mentioned in the description text are ignored entirely.
function extractBulletTitles(sectionText) {
	const lines = sectionText
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.startsWith('*') || line.startsWith('-'));

	return lines
		.map((line) => {
			const content = line.replace(/^[*-]\s*/, ''); // strip leading bullet marker

			const colonIndex = content.indexOf(':');
			const titlePart = colonIndex !== -1 ? content.slice(0, colonIndex) : content;

			const bracketMatch = titlePart.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
			const title = bracketMatch ? bracketMatch[1] : titlePart;

			return title.trim();
		})
		.filter(Boolean);
}

// Splits the summary into categorized name lists, matching the section
// headers your summarize prompt already produces.
function parseCategorizedNames(summaryText) {
	return {
		characters: extractBulletTitles(extractSection(summaryText, 'Characters Involved')),
		locations: extractBulletTitles(extractSection(summaryText, 'Locations')),
		items: extractBulletTitles(extractSection(summaryText, 'Items & Loot')),
	};
}

// Windows/Mac forbid certain characters in filenames — strip them so a name
// like "Merchant: Grix" doesn't crash the file write.
function toSafeFileName(name) {
	return name.replace(/[\\/:*?"<>|]/g, '').trim();
}

async function generateEntityNote(name, category, transcriptText) {
const prompt = `You are an expert Dungeons & Dragons campaign archivist creating a new Obsidian wiki note.

Your task is to create a useful, accurate, standalone reference note for a campaign entity identified in a session transcript.

ENTITY NAME: "${name}"
ENTITY CATEGORY: "${category}"

The entity was identified during the session transcript below and is believed not to have an existing note in the Obsidian vault.

Write a clear, factual description of the entity using only information explicitly supported by the transcript or cautious conclusions that can reasonably be drawn from it.

The note will be saved as an Obsidian Markdown file, with the filename based on the entity's name. It will be linked from session summaries and other campaign notes.

ACCURACY

Use the transcript as your primary source of information.

Include confirmed details and reasonable contextual inferences, but never invent lore, history, statistics, motivations, abilities, relationships, or events.

Distinguish facts from rumours, suspicions, beliefs, and unverified claims made by characters.

If the transcript contains very little information about the entity, produce a short note containing only what is known. Do not pad the note with speculation.

STANDALONE REFERENCE

Write the note so that a reader can understand the entity without having to read the original session transcript.

Explain what the entity is, why it matters, and what is known about it.

Include relevant context from the transcript rather than simply stating that the entity appeared in the session.

OBSIDIAN WIKILINKS

Use [[double-bracket wikilinks]] for other identifiable campaign entities mentioned in the note.

Link relevant characters, NPCs, locations, factions, organisations, quests, items, and other significant entities where appropriate.

Use consistent canonical names when they can be identified confidently.

Do not create links for generic words, ordinary objects, or entities that cannot be identified reliably.

Do not link the entity's own name unnecessarily throughout its note. The filename already identifies the note.

Do not claim that a linked note exists in the vault. You have not been given the vault's contents and cannot verify whether the link resolves.

NO DUPLICATE LORE

Focus on information relevant to this specific entity.

Avoid repeating large amounts of general campaign history or unrelated events. Link to related entities rather than explaining their entire histories.

If a character, location, or item is only briefly mentioned, include only the context necessary to explain its relevance to this entity.

TRANSCRIPT ERRORS

The transcript was generated using speech-to-text and may contain misheard names, broken sentences, incorrect D&D terminology, and transcription errors.

Use context to correct obvious mistakes when the intended meaning is clear.

Do not confidently assign an uncertain name or detail to the wrong entity. If a significant detail remains ambiguous, state the uncertainty briefly or omit the detail if it is not essential.

WRITING STYLE

Use a neutral, factual, encyclopaedic tone in the third person.

Write clearly and naturally, using complete sentences.

Prefer useful paragraphs and short Markdown sections over excessive bullet points.

Do not address the reader directly or include personal opinions, narrative embellishments, or out-of-character commentary.

MARKDOWN AND FILE STRUCTURE

Use valid Obsidian Markdown.

Do not include a top-level heading containing the entity's name, because Obsidian already displays the filename as the note title.

Begin with a concise introductory paragraph explaining what the entity is.

Use appropriate second-level headings (##) for additional sections when there is enough information to justify them.

Do not include the original transcript, a prompt explanation, a preamble, or a closing message.

Return only the completed note content, ready to be written directly to a .md file.

Adapt the note structure to the entity's actual category. Do not include empty headings or force information into sections that are not relevant.

CHARACTERS AND NPCS

Describe, where known:

Identity and role in the campaign.

Appearance and distinguishing characteristics.

Personality, behaviour, and mannerisms.

Known affiliations, relationships, allies, and enemies.

Abilities, occupation, influence, or notable possessions.

Important actions, dialogue, and events involving the character.

Known goals, motivations, and intentions, distinguishing facts from speculation.

Current location, condition, and status, if established.

Do not assume a character's motives, personality, alignment, abilities, or background without evidence.

PLAYER CHARACTERS

If the entity is a player character, record only details established in the transcript. Do not invent a class, race, level, backstory, equipment, statistics, or player identity.

LOCATIONS

Describe, where known:

Type of location and its geographical or political context.

Appearance, atmosphere, and notable features.

Important buildings, landmarks, inhabitants, or environmental hazards.

Relevant history, purpose, ownership, or significance.

Events that occurred there.

Connections to other locations, characters, factions, or quests.

Do not invent maps, geographical relationships, historical events, or environmental details.

ITEMS AND EQUIPMENT

Describe, where known:

What the item is and what it looks like.

Its known purpose, function, properties, or magical effects.

Its origin or history, if established.

Who owns, carries, discovered, or used it.

Important events involving the item.

Any known limitations, risks, or unresolved questions about it.

Distinguish confirmed magical properties from assumptions or rumours. Do not invent item statistics, mechanics, effects, or rarity.

FACTIONS AND ORGANISATIONS

Describe, where known:

The organisation's purpose and known activities.

Its members, leaders, and notable associates.

Its territory, influence, resources, or structure.

Its relationships with other factions and characters.

Its goals, methods, and role in the campaign.

Important events involving the organisation.

Do not assume that an organisation is hostile, friendly, lawful, or unlawful unless the evidence supports that description.

QUESTS AND STORYLINES

Describe, where known:

The objective or central problem.

Who initiated, assigned, or is affected by it.

The reason it matters to the party.

Important clues, leads, obstacles, and developments.

Current progress and confirmed outcomes.

Outstanding objectives and unresolved questions.

Relevant characters, locations, items, and factions.

Clearly distinguish completed objectives from active, failed, abandoned, or unresolved ones. Do not assume that a quest is active merely because it was mentioned.

OTHER ENTITY TYPES

If the category does not fit the types above, create a suitable reference note based on what the entity actually is.

Choose relevant headings and focus on its identity, significance, relationships, and known information. Do not force it into an inappropriate template.

Before returning the note, ensure that:

The entity is correctly identified and described.

Every factual claim is supported by the transcript or a reasonable, clearly qualified inference.

Relevant related entities use consistent Obsidian wikilinks.

The note does not invent missing information or duplicate unrelated lore.

The structure matches the entity category and the amount of available information.

There is no top-level heading repeating the entity name.

The output contains only the completed Obsidian Markdown note.

${transcriptText}`;

	return askChatGPT(prompt);
}

// Main entry point: compares the summary's linked names against the vault,
// creates a .md file (with an AI-written description) for anything new.
async function syncObsidianEntities(vaultPath, summaryText, transcriptText, subfolders = {}) {
	const existing = getExistingNoteNames(vaultPath);
	const categorized = parseCategorizedNames(summaryText);
	const created = [];

	for (const [category, names] of Object.entries(categorized)) {
		for (const name of names) {
			if (existing.has(name.toLowerCase())) continue; // already have a note for this

			console.log(`Creating new Obsidian note for ${category}: ${name}`);
			const description = await generateEntityNote(name, category, transcriptText);

			const folder = subfolders[category] ? path.join(vaultPath, subfolders[category]) : vaultPath;
			if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

			const filePath = path.join(folder, `${toSafeFileName(name)}.md`);
			fs.writeFileSync(filePath, description);

			created.push({ name, category, filePath });
			existing.add(name.toLowerCase()); // prevent duplicate creation if the same name appears twice in one summary
		}
	}

	return created;
}

module.exports = { syncObsidianEntities, getExistingNoteNames, parseCategorizedNames };