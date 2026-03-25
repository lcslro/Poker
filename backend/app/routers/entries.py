from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from ..database import get_db
from ..models import Entry, Session
from ..routers.auth import get_current_player
from ..schemas import EntryCreate, EntryOut, EntryReentry, EntryUpdate

router = APIRouter(prefix="/entries", tags=["entries"])


@router.get("/session/{session_id}", response_model=list[EntryOut])
def list_entries(
    session_id: int, db: DBSession = Depends(get_db), _=Depends(get_current_player)
):
    return db.query(Entry).filter(Entry.session_id == session_id).all()


@router.post("/", response_model=EntryOut, status_code=status.HTTP_201_CREATED)
def create_entry(
    body: EntryCreate,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_player),
):
    session = db.get(Session, body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    if session.status == "closed":
        raise HTTPException(status_code=400, detail="Sessão já encerrada")
    entry = Entry(**body.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.patch("/{entry_id}/reentry", response_model=EntryOut)
def add_reentry(
    entry_id: int,
    body: EntryReentry,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_player),
):
    entry = db.get(Entry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry não encontrado")
    if entry.session.status == "closed":
        raise HTTPException(status_code=400, detail="Sessão já encerrada")
    entry.reentries = (entry.reentries or 0) + body.chips_add
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=EntryOut)
def update_entry(
    entry_id: int,
    body: EntryUpdate,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_player),
):
    entry = db.get(Entry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry não encontrado")
    entry.chips_end = body.chips_end
    db.commit()
    db.refresh(entry)
    return entry
