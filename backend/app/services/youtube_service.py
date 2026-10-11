from pathlib import Path
import subprocess


class YouTubeService:
    @staticmethod
    def download_video(youtube_url: str, output_dir: Path) -> Path:
        """
        Downloads a YouTube video into the specified project folder.

        Args:
            youtube_url: YouTube video URL
            output_dir: Folder where the video will be saved

        Returns:
            Path to the downloaded video
        """

        output_dir.mkdir(parents=True, exist_ok=True)

        video_path = output_dir / "source.mp4"

        command = [
            "yt-dlp",
            "-f",
            "bestvideo+bestaudio/best",
            "-o",
            str(video_path),
            youtube_url,
        ]

        subprocess.run(command, check=True)

        return video_path