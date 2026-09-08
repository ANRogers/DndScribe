const fs = require('node:fs');
const path = require('node:path');
const prism = require('prism-media');
const wav = require('wav');
const { EndBehaviorType } = require('@discordjs/voice');

const TMP_DIR = path.join(__dirname, 'tmp_audio');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

function setupVoiceCapture(connection, onClipReady) {
	const receiver = connection.receiver;
	const active = new Set();

	receiver.speaking.on('start', (userId) => {
		if (active.has(userId)) return;
		active.add(userId);

		const opusStream = receiver.subscribe(userId, {
			end: { behavior: EndBehaviorType.AfterSilence, duration: 1200 },
		});

		const decoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
		const filePath = path.join(TMP_DIR, `${userId}-${Date.now()}.wav`);
		const wavWriter = new wav.Writer({ channels: 2, sampleRate: 48000, bitDepth: 16 });
		const outStream = fs.createWriteStream(filePath);

		let cleanedUp = false;
        function cleanup(reason, err) {
            if (cleanedUp) return;
            cleanedUp = true;
            active.delete(userId);
            if (err) console.error(`Voice capture error for ${userId} (${reason}):`, err.message);

            // Not every stream-like object implements .destroy() the same way,
            // so check before calling to avoid a secondary crash during cleanup.
            for (const stream of [opusStream, decoder, wavWriter, outStream]) {
                if (stream && typeof stream.destroy === 'function') {
                    stream.destroy();
                }
            }

            fs.unlink(filePath, () => {});
        }

		opusStream.on('error', (err) => cleanup('opusStream', err));
		decoder.on('error', (err) => cleanup('decoder', err));
		wavWriter.on('error', (err) => cleanup('wavWriter', err));
		outStream.on('error', (err) => cleanup('outStream', err));

		opusStream.pipe(decoder).pipe(wavWriter).pipe(outStream);

		outStream.on('finish', () => {
			if (cleanedUp) return; // an error already handled this clip, don't double-process
			active.delete(userId);
			if (fs.statSync(filePath).size < 4000) {
				fs.unlink(filePath, () => {});
				return;
			}
			onClipReady(userId, filePath);
		});
	});
}

module.exports = { setupVoiceCapture };