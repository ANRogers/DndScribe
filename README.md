# DnD Scribe

A Discord bot that joins your D&D session's voice channel, transcribes each player's dialogue **separately** (labeled by their in-game character name, not their Discord username), and uses AI to turn the resulting transcript into a session summary — automatically generating new Obsidian wiki notes for any character, location, or item mentioned for the first time.

Built with **Node.js**, **Python**, **Discord.js**, **faster-whisper**, and the **OpenAI API**.

## Why this exists

Recording a tabletop session usually means one mixed audio file and a lot of manual note-taking afterward. This bot instead uses Discord's own voice pipeline — which already separates each speaker's audio at the platform level — so there's no need for speaker diarization (guessing who's talking from voice characteristics alone). Combine that with a persistent local Whisper model and a GPT-powered summarization step, and a full session's dialogue turns into a labeled transcript and a linked Obsidian campaign wiki with minimal manual effort.

## Features

- **Per-speaker transcription** — captures and transcribes each Discord user's audio independently, using Discord's voice receiver API rather than a single mixed recording
- **Character name mapping** — players self-assign their D&D character name once; transcripts label dialogue by character, not Discord username
- **Persistent local transcription** — a background Python service keeps the Whisper model loaded in memory for the whole session, avoiding reload overhead on every clip
- **AI session summaries** — generates a structured Markdown summary (key events, characters, locations, items, open threads) from the raw transcript
- **Automatic Obsidian wiki building** — scans an existing Obsidian vault, detects any character/location/item mentioned in a summary that doesn't have a note yet, and generates one automatically using the transcript as source material
- **Live web viewer** — a small local webpage shows the transcript updating in real time via WebSockets as people talk
- **Long-session resilience** — transcript lines are written to disk incrementally (not just at session end), voice disconnects are detected and recovered from, and a single corrupted audio packet won't crash the bot
- **Owner-restricted controls** — session start/end commands are locked to a configured Discord user ID

## How it works

1. `/scribe-start` joins your voice channel and begins listening
2. As each person talks, their audio is captured separately and, after a short silence, sent to a locally running Whisper server for transcription
3. Each transcribed line is written to a session file immediately, labeled with the speaker's assigned character name
4. `/scribe-end` leaves the channel and finalizes the transcript
5. A summarize command sends the transcript to GPT, saves the resulting summary as a Markdown file, and checks it against your Obsidian vault — creating new notes for anything mentioned that doesn't already exist there

## Requirements

- Node.js 18+
- Python 3.9+
- FFmpeg installed and on your PATH
- A Discord bot application (from the [Discord Developer Portal](https://discord.com/developers/applications))
- An OpenAI API key (for summarization — separate from a ChatGPT subscription)
- An Obsidian vault (optional — only needed for the auto-wiki-building feature)

## Setup

```bash
# Install Node dependencies
npm install

# Set up Python environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

Create `config.json` in the project root:

```json
{
	"token": "your-discord-bot-token",
	"clientId": "your-application-client-id",
	"guildId": "your-server-id",
	"pythonPath": "path/to/venv/python.exe",
	"ownerId": "your-discord-user-id",
	"obsidianPath": "path/to/your/obsidian/vault",
	"ApiKey": "your-openai-api-key"
}
```

Register slash commands (one-time, or after changing command definitions):

```bash
node deploy-commands.js
```

Start the bot:

```bash
node index.js
```

On first run, `faster-whisper` will download its model — this can take a few minutes depending on model size. Wait for `[whisper-server] READY` in the console before starting a real session.

## Commands

| Command | Description |
|---|---|
| `/scribe-start [session]` | Joins your voice channel and begins transcribing (owner-only). Optional session number labels the saved transcript. |
| `/scribe-end` | Leaves the voice channel and finalizes the session transcript. |
| `/set-character <name>` | Assigns your Discord account to a character name for transcript labeling. |
| `/summarise <filename>` | Sends a saved transcript to GPT, saves a Markdown summary, and generates new Obsidian notes for any newly mentioned characters, locations, or items. |
| `/reload <command>` | Hot-reloads a command file without restarting the bot. |

## Live transcript viewer

While the bot is running, open `http://localhost:3000` in a browser to see the current session's transcript update live as people talk, styled as a scrollable log rather than a growing page.

## Known limitations

- Transcription happens per-utterance, not as live streaming captions — there's a short delay between someone speaking and their line appearing
- Overlapping speech from multiple people is transcribed correctly but interleaved based on when each clip finishes processing, not perfectly reflecting real-time overlap
- Obsidian note matching is name-based; near-duplicate names (e.g. "Yerg" vs "Yerg's") may create separate notes rather than being recognized as the same entity
- The bot must stay running on whatever machine started it for the duration of a session

## A note on consent

This bot records real people's voices. Let your group know before starting a session, even for a casual home game.
