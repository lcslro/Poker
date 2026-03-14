from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from ..database import get_db
from ..models import Player
from ..routers.auth import get_current_player, hash_password
from ..schemas import PlayerCreate, PlayerOut, PlayerUpdate

router = APIRouter(prefix="/players", tags=["players"])


@router.get("/", response_model=list[PlayerOut])
def list_players(db: DBSession = Depends(get_db), _=Depends(get_current_player)):
    return db.query(Player).all()


@router.post("/", response_model=PlayerOut, status_code=status.HTTP_201_CREATED)
def create_player(body: PlayerCreate, db: DBSession = Depends(get_db)):
    if db.query(Player).filter(Player.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    player = Player(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        is_admin=body.is_admin,
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@router.get("/{player_id}", response_model=PlayerOut)
def get_player(player_id: int, db: DBSession = Depends(get_db), _=Depends(get_current_player)):
    player = db.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Jogador não encontrado")
    return player


@router.put("/{player_id}", response_model=PlayerOut)
def update_player(
    player_id: int,
    body: PlayerUpdate,
    db: DBSession = Depends(get_db),
    current: Player = Depends(get_current_player),
):
    player = db.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Jogador não encontrado")
    if current.id != player_id and not current.is_admin:
        raise HTTPException(status_code=403, detail="Sem permissão")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(player, field, value)
    db.commit()
    db.refresh(player)
    return player


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_player(
    player_id: int,
    db: DBSession = Depends(get_db),
    current: Player = Depends(get_current_player),
):
    if not current.is_admin:
        raise HTTPException(status_code=403, detail="Sem permissão")
    player = db.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Jogador não encontrado")
    db.delete(player)
    db.commit()
