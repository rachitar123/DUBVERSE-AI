
import shutil
import requests
import subprocess
from app.services.audio_service import AudioService
from app.services.transcription_service import TranscriptionService
from app.services.translation_service import TranslationService
from app.services.tts_service import TTSService
from app.services.video_service import VideoService
from app.config import (
    UPLOADS_DIR, OUTPUTS_DIR,
    OPENAI_API_KEY, GEMINI_API_KEY,
    ELEVENLABS_API_KEY, INWORLD_API_KEY, INWORLD_VOICE_ID
)
from app.models import Project, TranscriptSegment, UserSettings

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        return res.stdout
    except Exception as e:
        print(f"Subprocess command error: {e}")
        return None

def resolve_translation_provider(user_settings: UserSettings):
    """
    Fallback Engine for Translation (OpenAI -> Gemini -> Error)
    """
    openai_key = (user_settings.openai_api_key if user_settings and user_settings.openai_api_key else OPENAI_API_KEY)
    gemini_key = (user_settings.gemini_api_key if user_settings and user_settings.gemini_api_key else GEMINI_API_KEY)

    if openai_key:
        return {"provider": "openai", "key": openai_key}
    elif gemini_key:
        return {"provider": "gemini", "key": gemini_key}
    else:
        return {
            "provider": None,
            "error": (
                "Missing LLM API Keys! Translation requires either OPENAI_API_KEY (obtain at https://platform.openai.com/api-keys) "
                "or GEMINI_API_KEY (obtain at https://aistudio.google.com/app/apikey). Please configure at least one in Settings."
            )
        }

def resolve_tts_provider(user_settings: UserSettings):
    """
    Fallback Engine for Voice Cloning (ElevenLabs -> Inworld -> Error)
    """
    eleven_key = (user_settings.elevenlabs_api_key if user_settings and user_settings.elevenlabs_api_key else ELEVENLABS_API_KEY)
    inworld_key = (user_settings.inworld_api_key if user_settings and user_settings.inworld_api_key else INWORLD_API_KEY)

    if eleven_key:
        return {"provider": "elevenlabs", "key": eleven_key}
    elif inworld_key:
        return {"provider": "inworld", "key": inworld_key}
    else:
        return {
            "provider": None,
            "error": (
                "Missing Speech Synthesis API Keys! Voice cloning requires either ELEVENLABS_API_KEY (obtain at https://elevenlabs.io) "
                "or INWORLD_API_KEY (obtain at https://inworld.ai). Please configure at least one in Settings."
            )
        }
def process_project_pipeline(project_id: int, db_session_factory):
    db = db_session_factory()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return

        user_settings = db.query(UserSettings).filter(UserSettings.user_id == project.user_id).first()

        # Check Provider Requirements
        llm_provider = resolve_translation_provider(user_settings)
        tts_provider = resolve_tts_provider(user_settings)
        if not llm_provider["provider"]:
            raise Exception(llm_provider["error"])

        if not tts_provider["provider"]:
            raise Exception(tts_provider["error"])

        # Stage 1: EXTRACTING AUDIO (10% - 25%)
        project.status = "EXTRACTING"
        project.progress = 15
        project.current_step = "Extracting high-fidelity audio track from media source..."
        project.estimated_time_remaining = 90
        db.commit()

              # Locate input video
        print("\n========== PROJECT DEBUG ==========")
        print("Project ID:", project.id)
        print("Stored URL:", project.original_video_url)
        print("Video filename:", project.video_filename)
        print("===================================\n")

        input_video_path = None

        if project.video_filename:
            input_video_path = UPLOADS_DIR / project.video_filename
        # Download YouTube video if needed
        if project.original_video_url and not input_video_path:
            video_out_name = f"project_{project.id}_source.mp4"
            target_file = UPLOADS_DIR / video_out_name

            run_cmd([
                "yt-dlp",
                "--extractor-args",
                "youtube:player_client=android",
                "-f",
                "mp4/best",
                "-o",
                str(target_file),
                project.original_video_url,
            ])

            if target_file.exists():
                project.video_filename = video_out_name
                input_video_path = target_file
                db.commit()

        # Ensure we have a valid video
        if input_video_path is None or not input_video_path.exists():
            raise Exception("Input video not found.")

        # Create project output folder
        project_dir = OUTPUTS_DIR / f"project_{project.id}"
        project_dir.mkdir(parents=True, exist_ok=True)

        # Extract audio
        mp3_path, wav_path = AudioService.extract_audio(
            input_video_path,
            project_dir,
        )
        # Stage 2: TRANSCRIBING AUDIO (25% - 50%)
        project.status = "TRANSCRIBING"
        project.progress = 35
        project.current_step = "Running speech recognition & segment timing alignment..."
        project.estimated_time_remaining = 65
        db.commit()

        # Transcribe audio using Whisper
        transcriber = TranscriptionService()

        segments = transcriber.transcribe(
            wav_path,
            project_dir,
        )

               # Stage 3: TRANSLATING TEXT (50% - 70%)
        project.status = "TRANSLATING"
        project.progress = 60
        project.current_step = (
            f"Translating segments to {project.target_language}..."
        )
        project.estimated_time_remaining = 40
        db.commit()

        # Remove previous transcript
        db.query(TranscriptSegment).filter(
            TranscriptSegment.project_id == project.id
        ).delete()

        # -----------------------------
        # Translate all transcript segments
        # -----------------------------
        translator = TranslationService()

        # Replace this with your own TranslationService API
        segments = translator.translate_segments(
            segments,
            target_language=project.target_language or "Hindi",
            )

        # Save translated transcript into database
        for idx, seg in enumerate(segments):
            t_seg = TranscriptSegment(
                project_id=project.id,
                segment_index=idx,
                start_time=seg["start"],
                end_time=seg["end"],
                original_text=seg["english"],
                translated_text=seg["hindi"],
                speaker=seg.get("speaker", "Speaker 1"),
            )

            db.add(t_seg)

        db.commit()

                # Stage 4: SYNTHESIZING VOICE (70% - 85%)
        project.status = "SYNTHESIZING"
        project.progress = 75
        project.current_step = (
            f"Synthesizing neural voice clone (TTS Provider: {tts_provider['provider'] or 'Inworld'})..."
        )
        project.estimated_time_remaining = 20
        db.commit()

        # Generate speech for every translated segment
        tts = TTSService()

        chunks_dir = project_dir / "generated_chunks"
        chunks_dir.mkdir(parents=True, exist_ok=True)

        generated_files = tts.generate_segments(
            segments,
            chunks_dir,
            target_language=project.target_language or "Hindi",
            voice_id=project.voice_id or INWORLD_VOICE_ID,
        )

        db.commit()
               # Stage 5: SYNCING AUDIO-VIDEO TIMELINE (85% - 98%)
        project.status = "SYNCING"
        project.progress = 90
        project.current_step = "Executing FFmpeg retiming and master audio mix overlay..."
        project.estimated_time_remaining = 5
        db.commit()

        # Build final dubbed video
        final_video = VideoService.build_video(
            segments=segments,
            original_video=input_video_path,
            generated_chunks_dir=chunks_dir,
            output_dir=project_dir,
        )

        out_video_name = f"dubbed_project_{project.id}.mp4"
        out_audio_name = f"dubbed_project_{project.id}.mp3"

        out_video_path = OUTPUTS_DIR / out_video_name
        out_audio_path = OUTPUTS_DIR / out_audio_name

        # Copy generated video
        shutil.copy(
            final_video,
            out_video_path,
        )

        # Copy generated audio
        final_audio = project_dir / "final_hindi_audio.mp3"

        if final_audio.exists():
            shutil.copy(
                final_audio,
                out_audio_path,
            )

        project.output_video_filename = out_video_name
        project.output_audio_filename = out_audio_name
        project.duration_seconds = (
            segments[-1]["end"] if segments else 0
        )
        project.segments_count = len(segments)
        project.status = "COMPLETED"
        project.progress = 100
        project.current_step = "Dubbing pipeline successfully completed!"
        project.estimated_time_remaining = 0

        db.commit()

    except Exception as e:
        print(f"Error processing project {project_id}: {e}")

        if project:
            project.status = "FAILED"
            project.error_message = str(e)
            project.current_step = f"Processing failed: {str(e)}"
            db.commit()

    finally:
        db.close()