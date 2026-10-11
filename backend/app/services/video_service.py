import shutil
import subprocess
from pathlib import Path


class VideoService:

    @staticmethod
    def run(cmd):
        print("\nRunning:", " ".join(map(str, cmd)))
        subprocess.run(cmd, check=True)

    @staticmethod
    def get_duration(file: Path):

        print(f"\nGetting duration for: {file}")

        if not file.exists():
            raise FileNotFoundError(f"Audio chunk not found: {file}")

        try:
            result = subprocess.run(
                [
                    "ffprobe",
                    "-v",
                    "error",
                    "-show_entries",
                    "format=duration",
                    "-of",
                    "default=noprint_wrappers=1:nokey=1",
                    str(file),
                ],
                capture_output=True,
                text=True,
                check=True,
            )

            duration = float(result.stdout.strip())

            print(f"Duration: {duration:.2f}s")

            return duration

        except subprocess.CalledProcessError as e:

            print("\n========== FFPROBE FAILED ==========")
            print("File:", file)
            print("Return code:", e.returncode)
            print("STDOUT:", e.stdout)
            print("STDERR:", e.stderr)
            print("====================================")

            raise

        except Exception as e:

            print("\nUnexpected ffprobe error:", e)
            raise

    @classmethod
    def build_video(
        cls,
        segments,
        original_video: Path,
        generated_chunks_dir: Path,
        output_dir: Path,
    ):

        temp_dir = output_dir / "temp_clips"

        if temp_dir.exists():
            shutil.rmtree(temp_dir)

        temp_dir.mkdir(parents=True)

        final_audio = output_dir / "final_hindi_audio.mp3"
        final_video = output_dir / "dubbed_video.mp4"

        audio_inputs = []
        audio_filters = []
        updated_segments = []

        timeline = 0.0

        print("\n========== BUILDING AUDIO ==========")

        for i, seg in enumerate(segments):

            chunk = generated_chunks_dir / f"chunk_{i}.mp3"

            print(f"\nProcessing chunk {i}: {chunk}")

            if not chunk.exists():
                print("Chunk missing, skipping.")
                continue

            duration = cls.get_duration(chunk)

            start = timeline
            end = start + duration

            updated_segments.append(
                {
                    "video_start": seg["start"],
                    "video_end": seg["end"],
                    "new_start": start,
                    "new_end": end,
                }
            )

            delay = int(start * 1000)

            audio_inputs += ["-i", str(chunk)]

            audio_filters.append(
                f"[{len(audio_inputs)//2-1}:a]"
                f"adelay={delay}|{delay}[a{i}]"
            )

            timeline = end

        print("\n========== COMBINING AUDIO ==========")

        mix = "".join(f"[a{i}]" for i in range(len(updated_segments)))

        filter_complex = (
            ";".join(audio_filters)
            + ";"
            + f"{mix}amix=inputs={len(updated_segments)}"
            ":duration=longest:normalize=0"
        )

        cls.run(
            [
                "ffmpeg",
                "-y",
                *audio_inputs,
                "-filter_complex",
                filter_complex,
                "-c:a",
                "mp3",
                str(final_audio),
            ]
        )

        concat_file = temp_dir / "concat.txt"

        with open(concat_file, "w") as f:

            print("\n========== BUILDING VIDEO CLIPS ==========")

            for i, seg in enumerate(updated_segments):

                original = seg["video_end"] - seg["video_start"]
                new = seg["new_end"] - seg["new_start"]

                speed = original / new

                clip = temp_dir / f"clip_{i}.mp4"

                print(f"Clip {i} speed = {speed:.3f}")

                cls.run(
                    [
                        "ffmpeg",
                        "-y",
                        "-ss",
                        str(seg["video_start"]),
                        "-to",
                        str(seg["video_end"]),
                        "-i",
                        str(original_video),
                        "-filter:v",
                        f"setpts={1/speed}*PTS",
                        "-an",
                        str(clip),
                    ]
                )

                f.write(f"file '{clip.resolve()}'\n")

        rebuilt = temp_dir / "rebuilt.mp4"

        print("\n========== CONCATENATING VIDEO ==========")

        cls.run(
            [
                "ffmpeg",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(concat_file),
                "-c",
                "copy",
                str(rebuilt),
            ]
        )

        print("\n========== MERGING AUDIO + VIDEO ==========")

        cls.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(rebuilt),
                "-i",
                str(final_audio),
                "-map",
                "0:v:0",
                "-map",
                "1:a:0",
                "-c:v",
                "copy",
                "-c:a",
                "aac",
                str(final_video),
            ]
        )

        print("\n✅ Dubbed video created successfully!")
        print(final_video)

        return final_video