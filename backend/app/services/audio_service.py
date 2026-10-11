from pathlib import Path
import subprocess


class AudioService:
    @staticmethod
    def extract_audio(video_path: Path, output_dir: Path) -> tuple[Path, Path]:
        """
        Extract MP3 and WAV audio from a video.

        Args:
            video_path: Path to the downloaded video
            output_dir: Project output directory

        Returns:
            (mp3_path, wav_path)
        """

        output_dir.mkdir(parents=True, exist_ok=True)

        mp3_path = output_dir / "audio.mp3"
        wav_path = output_dir / "audio.wav"

        # Extract MP3
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(video_path),
                str(mp3_path),
            ],
            check=True,
        )

        # Convert to 16kHz mono WAV for Whisper
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(mp3_path),
                "-ar",
                "16000",
                "-ac",
                "1",
                str(wav_path),
            ],
            check=True,
        )

        return mp3_path, wav_path