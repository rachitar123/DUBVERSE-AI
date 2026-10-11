import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Project, TranscriptSegment
from app.schemas import (
    ProjectCreate, ProjectResponse, ProjectDetailResponse, 
    TranscriptSegmentResponse, TranscriptSegmentUpdate
)
from app.auth import get_current_user
from app.config import UPLOADS_DIR, OUTPUTS_DIR
from app.services.task_queue import enqueue_dubbing_task

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.post("", response_model=ProjectResponse)
def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = Project(
        user_id=current_user.id,
        title=project_in.title,
        source_language=project_in.source_language or "auto",
        target_language=project_in.target_language,
        voice_id=project_in.voice_id,
        voice_name=project_in.voice_name or "Voice Clone",
        original_video_url=project_in.youtube_url,
        status="QUEUED",
        progress=5,
        current_step="Project created. Queued for background processing.",
        estimated_time_remaining=120
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Trigger background dubbing process
    enqueue_dubbing_task(project.id)

    return project

@router.post("/upload", response_model=ProjectResponse)
def create_project_with_upload(
    title: str = Form(...),
    target_language: str = Form("Hindi"),
    voice_id: str = Form("Anjali"),
    voice_name: str = Form("Anjali"),
    source_language: str = Form("auto"),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_ext = os.path.splitext(file.filename)[1] or ".mp4"
    safe_filename = f"user_{current_user.id}_{int(os.urandom(4).hex(), 16)}{file_ext}"
    file_path = UPLOADS_DIR / safe_filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    project = Project(
        user_id=current_user.id,
        title=title,
        source_language=source_language,
        target_language=target_language,
        voice_id=voice_id,
        voice_name=voice_name,
        video_filename=safe_filename,
        status="QUEUED",
        progress=5,
        current_step="Video uploaded successfully. Queued for processing.",
        estimated_time_remaining=120
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Trigger background dubbing process
    enqueue_dubbing_task(project.id)

    return project

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project).filter(Project.user_id == current_user.id)
    if status and status.upper() != "ALL":
        query = query.filter(Project.status == status.upper())
    if search:
        query = query.filter(Project.title.ilike(f"%{search}%"))
    
    return query.order_by(Project.created_at.desc()).all()

@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/{project_id}/process", response_model=ProjectResponse)
def retry_project_process(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.status = "QUEUED"
    project.progress = 5
    project.current_step = "Re-queued for processing"
    project.error_message = None
    db.commit()

    enqueue_dubbing_task(project.id)
    return project

@router.put("/{project_id}/segments/{segment_id}", response_model=TranscriptSegmentResponse)
def update_transcript_segment(
    project_id: int,
    segment_id: int,
    seg_in: TranscriptSegmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    segment = db.query(TranscriptSegment).filter(
        TranscriptSegment.id == segment_id, 
        TranscriptSegment.project_id == project_id
    ).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")

    if seg_in.translated_text is not None:
        segment.translated_text = seg_in.translated_text
    if seg_in.original_text is not None:
        segment.original_text = seg_in.original_text

    db.commit()
    db.refresh(segment)
    return segment

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@router.get("/{project_id}/download/{fmt}")
def download_project_artifact(
    project_id: int,
    fmt: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to download this project")

    fmt = fmt.lower()
    if fmt == "vtt":
        vtt_content = "WEBVTT\n\n"
        for seg in project.segments:
            s_min, s_sec = divmod(seg.start_time, 60)
            e_min, e_sec = divmod(seg.end_time, 60)
            vtt_content += f"00:{int(s_min):02d}:{s_sec:06.3f} --> 00:{int(e_min):02d}:{e_sec:06.3f}\n{seg.translated_text}\n\n"
        return Response(content=vtt_content, media_type="text/vtt", headers={"Content-Disposition": f"attachment; filename=subtitles_{project.id}.vtt"})

    elif fmt == "json":
        json_data = [
            {
                "start": seg.start_time,
                "end": seg.end_time,
                "original": seg.original_text,
                "translated": seg.translated_text
            }
            for seg in project.segments
        ]
        return Response(content=str(json_data).replace("'", '"'), media_type="application/json", headers={"Content-Disposition": f"attachment; filename=transcript_{project.id}.json"})

    elif fmt == "mp4":
        file_path = None
        if project.output_video_filename:
            path = OUTPUTS_DIR / project.output_video_filename
            if path.exists(): file_path = path
        if not file_path and project.video_filename:
            path = UPLOADS_DIR / project.video_filename
            if path.exists(): file_path = path
        
        if not file_path:
            raise HTTPException(status_code=404, detail="Video file not found")
            
        return FileResponse(path=file_path, media_type="video/mp4", headers={"Accept-Ranges": "bytes", "Content-Type": "video/mp4"})

    elif fmt == "mp3":
        if project.output_audio_filename:
            path = OUTPUTS_DIR / project.output_audio_filename
            if path.exists():
                return FileResponse(path=path, media_type="audio/mpeg")
        raise HTTPException(status_code=404, detail="Audio file not found")

    raise HTTPException(status_code=400, detail="Invalid export format")
