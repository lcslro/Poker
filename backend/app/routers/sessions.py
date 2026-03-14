from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from ..database import get_db
from ..models import Session
from ..routers.auth import get_current_player
from ..schemas import SessionCreate, SessionOut, SessionUpdate

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/", response_model=list[SessionOut])
def list_sessions(db: DBSession = Depends(get_db), _=Depends(get_current_player)):
    return db.query(Session).order_by(Session.date.desc()).all()


@router.post("/", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    body: SessionCreate,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_player),
):
    session = Session(**body.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/{session_id}", response_model=SessionOut)
def get_session(session_id: int, db: DBSession = Depends(get_db), _=Depends(get_current_player)):
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    return session


@router.put("/{session_id}", response_model=SessionOut)
def update_session(
    session_id: int,
    body: SessionUpdate,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_player),
):
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(session, field, value)
    db.commit()
    db.refresh(session)
    return session
