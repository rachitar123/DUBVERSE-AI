import json
import subprocess
import os
import shutil

SEGMENTS_FILE = "segments.json"

VIDEO_FILE = "video.mp4"

FINAL_AUDIO = "final_hindi_audio.mp3"
FINAL_VIDEO = "final_synced_dubbed_clonnedPartially.mp4"

TEMP_DIR = "temp_clips"

# -----------------------------------
# Helpers
# -----------------------------------

def run(cmd):
    subprocess.run(cmd, check=True)

def get_duration(file):

    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "csv=p=0",
        file
    ]

    return float(subprocess.check_output(cmd).decode().strip())

# -----------------------------------
# Prepare folders
# -----------------------------------

if os.path.exists(TEMP_DIR):
    shutil.rmtree(TEMP_DIR)

os.makedirs(TEMP_DIR, exist_ok=True)

# -----------------------------------
# Load segments
# -----------------------------------

with open(SEGMENTS_FILE, "r", encoding="utf-8") as f:
    segments = json.load(f)

# -----------------------------------
# STEP 1:
# Build natural Hindi audio timeline
# -----------------------------------

audio_inputs = []
audio_filters = []

timeline_cursor = 0.0

updated_segments = []

for i, seg in enumerate(segments):

    chunk = f"generated_chunks/chunk_{i}.mp3"

    if not os.path.exists(chunk):
        continue

    hindi_duration = get_duration(chunk)

    # place sequentially without overlap
    start_time = timeline_cursor
    end_time = start_time + hindi_duration

    updated_segments.append({
        "video_start": seg["start"],
        "video_end": seg["end"],
        "new_start": start_time,
        "new_end": end_time
    })

    start_ms = int(start_time * 1000)

    audio_inputs += ["-i", chunk]

    audio_filters.append(
        f"[{len(audio_inputs)//2 -1}:a]adelay={start_ms}|{start_ms}[a{i}]"
    )

    timeline_cursor = end_time

# Build audio mix
mix_inputs = "".join([f"[a{i}]" for i in range(len(updated_segments))])

filter_complex = ";".join(audio_filters) + ";" + \
    f"{mix_inputs}amix=inputs={len(updated_segments)}:duration=longest:normalize=0"

run([
    "ffmpeg",
    "-y",
    *audio_inputs,
    "-filter_complex", filter_complex,
    "-c:a", "mp3",
    FINAL_AUDIO
])

print("✅ Final Hindi audio built")

# -----------------------------------
# STEP 2:
# Create stretched video clips
# -----------------------------------

concat_file = os.path.join(TEMP_DIR, "concat.txt")

with open(concat_file, "w", encoding="utf-8") as concat:

    for i, seg in enumerate(updated_segments):

        original_duration = seg["video_end"] - seg["video_start"]
        new_duration = seg["new_end"] - seg["new_start"]

        clip_file = os.path.join(TEMP_DIR, f"clip_{i}.mp4")

        # speed factor
        speed = original_duration / new_duration

        # cut + retime only this segment
        run([
            "ffmpeg",
            "-y",
            "-ss", str(seg["video_start"]),
            "-to", str(seg["video_end"]),
            "-i", VIDEO_FILE,
            "-filter:v", f"setpts={1/speed}*PTS",
            "-an",
            clip_file
        ])

        concat.write(f"file '{os.path.abspath(clip_file)}'\n")

print("✅ Video clips generated")

# -----------------------------------
# STEP 3:
# Concatenate rebuilt video
# -----------------------------------

rebuilt_video = os.path.join(TEMP_DIR, "rebuilt_video.mp4")

run([
    "ffmpeg",
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_file,
    "-c", "copy",
    rebuilt_video
])

print("✅ Rebuilt stretched video")

# -----------------------------------
# STEP 4:
# Merge rebuilt video + Hindi audio
# -----------------------------------

run([
    "ffmpeg",
    "-y",
    "-i", rebuilt_video,
    "-i", FINAL_AUDIO,
    "-map", "0:v:0",
    "-map", "1:a:0",
    "-c:v", "copy",
    "-c:a", "aac",
    "-shortest",
    FINAL_VIDEO
])

print("\n🎬 DONE:", FINAL_VIDEO)