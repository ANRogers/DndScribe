import os
import sys

os.environ["HF_HUB_DISABLE_XET"] = "1"

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from faster_whisper import WhisperModel
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 5005
model_dir = os.path.join(os.path.dirname(__file__), "whisper_models")

print("Loading Whisper model... (this only happens once)", file=sys.stderr)
model = WhisperModel("small", device="cpu", compute_type="int8", download_root=model_dir)
print("READY", flush=True)  # Node watches for this line to know the server is up


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        wav_path = body.get("path")
        character_names = body.get("names", [])  # <-- passed in from Node

        prompt = "Dungeons and Dragons session."
        if character_names:
            prompt += " Character names: " + ", ".join(character_names) + "."

        try:
            segments, _ = model.transcribe(wav_path, language="en", vad_filter=True, initial_prompt=prompt)
            text = " ".join(seg.text.strip() for seg in segments).strip()
            response = {"text": text}
        except Exception as e:
            response = {"text": "", "error": str(e)}

        payload = json.dumps(response).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format, *args):
        pass  # silence default request logging clutter


server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)  # changed from HTTPServer
server.serve_forever()