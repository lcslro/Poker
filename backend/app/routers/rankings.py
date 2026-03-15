from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from ..database import get_db
from ..models import Entry, Player, Session as GameSession
from ..routers.auth import get_current_player
from ..schemas import PlayerRanking

router = APIRouter(prefix="/rankings", tags=["rankings"])


@router.get("/", response_model=list[PlayerRanking])
def get_rankings(db: DBSession = Depends(get_db), _=Depends(get_current_player)):
    players = db.query(Player).all()

    # Calcula MVP por sessão fechada
    closed_sessions = db.query(GameSession).filter(GameSession.status == "closed").all()
    mvp_counts: dict[int, int] = defaultdict(int)
    for session in closed_sessions:
        best_player_id = None
        best_profit = None
        for entry in session.entries:
            if entry.chips_end is None:
                continue
            profit = (entry.chips_end - entry.chips_start) * session.chip_value
            if best_profit is None or profit > best_profit:
                best_profit = profit
                best_player_id = entry.player_id
        if best_player_id is not None:
            mvp_counts[best_player_id] += 1

    result = []
    for player in players:
        entries = db.query(Entry).filter(Entry.player_id == player.id).all()
        if not entries:
            continue

        sessions_played = len(entries)
        profits = []
        for e in entries:
            if e.chips_end is not None:
                session = e.session
                profit = round((e.chips_end - e.chips_start) * session.chip_value, 2)
                profits.append(profit)

        wins = sum(1 for p in profits if p > 0)
        losses = sum(1 for p in profits if p <= 0)
        total_profit = round(sum(profits), 2)

        result.append(PlayerRanking(
            player_id=player.id,
            name=player.name,
            sessions_played=sessions_played,
            wins=wins,
            losses=losses,
            total_profit=total_profit,
            mvp_count=mvp_counts[player.id],
        ))

    result.sort(key=lambda x: x.total_profit, reverse=True)
    return result
