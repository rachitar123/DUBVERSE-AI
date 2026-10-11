import json
from pathlib import Path
import whisper


class TranscriptionService:
    def __init__(self, model_name: str = "medium"):
        """
        Load the Whisper model once when the service is created.
        """
        self.model = whisper.load_model(model_name)

    def transcribe(self, wav_path: Path, output_dir: Path):
        """
        Transcribe a WAV file and save segments.json.

        Args:
            wav_path: Path to audio.wav
            output_dir: Project folder

        Returns:
            List of transcript segments
        """

        result = self.model.transcribe(
            str(wav_path),
            language="en",
            task="transcribe",
            condition_on_previous_text=False,
            temperature=0
            )

        segments = []

        for seg in result["segments"]:
            segments.append({
                "start": seg["start"],
                "end": seg["end"],
                "english": seg["text"].strip(),
                "hindi": ""
            })

        output_file = output_dir / "segments.json"

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(
                segments,
                f,
                indent=2,
                ensure_ascii=False
            )

        return segments