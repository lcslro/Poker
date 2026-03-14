from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from ..database import get_db
from ..models import Entry, Session, Settlement
from ..routers.auth import get_current_player
from ..schemas import SettlementOut

router = APIRouter(prefix="/settle", tags=["settle"])


def _calc_settlements(entries: list[Entry], chip_value: float) -> list[dict]:
    balances = [
        {
            "player_id": e.player_id,
            "balance": round((e.chips_end - e.chips_start) * chip_value, 2),
        }
        for e in entries
        if e.chips_end is not None
    ]

    creditors = sorted([b for b in balances if b["balance"] > 0], key=lambda x: -x["balance"])
    debtors = sorted([b for b in balances if b["balance"] < 0], key=lambda x: x["balance"])

    txs = []
    ci, di = 0, 0
    while ci < len(creditors) and di < len(debtors):
        amount = min(creditors[ci]["balance"], -debtors[di]["balance"])
        if amount > 0.005:
            txs.append({
                "from_player": debtors[di]["player_id"],
                "to_player": creditors[ci]["player_id"],
                "amount": round(amount, 2),
            })
        creditors[ci]["balance"] -= amount
        debtors[di]["balance"] += amount
        if abs(creditors[ci]["balance"]) < 0.005:
            ci += 1
        if abs(debtors[di]["balance"]) < 0.005:
            di += 1

    return txs


@router.get("/{session_id}", response_model=list[SettlementOut])
def get_settlements(
    session_id: int, db: DBSession = Depends(get_db), _=Depends(get_current_player)
):
    return db.query(Settlement).filter(Settlement.session_id == session_id).all()


@router.post("/{session_id}", response_model=list[SettlementOut])
def calculate_and_save(
    session_id: int, db: DBSession = Depends(get_db), _=Depends(get_current_player)
):
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    entries = db.query(Entry).filter(Entry.session_id == session_id).all()
    if not entries:
        raise HTTPException(status_code=400, detail="Nenhum jogador na sessão")

    # Remove settlements anteriores
    db.query(Settlement).filter(Settlement.session_id == session_id).delete()

    txs = _calc_settlements(entries, session.chip_value)
    saved = []
    for tx in txs:
        s = Settlement(session_id=session_id, **tx)
        db.add(s)
        saved.append(s)

    session.status = "closed"
    db.commit()
    for s in saved:
        db.refresh(s)
    return saved
