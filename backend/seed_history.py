"""
Popula o banco com as 2 partidas históricas do PDF.
Executa na pasta backend: python seed_history.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine
from app.models import Base, Session, Entry, Settlement

Base.metadata.create_all(bind=engine)

CHIP_VALUE = 0.10
CHIPS_BASE = 200  # base neutra para garantir chips_end positivo

# player_id → nome (conforme seed.py)
# 1:Arthur 2:Rafael 3:Mateus 4:Guilherme 5:Lucas 6:Oswaldo 7:Julia 8:Kauã 9:Victor

SESSIONS = [
    {
        "date": "2026-02-01",
        "buy_in": 9.00,
        # lucro direto do PDF
        "players": [
            {"player_id": 1, "lucro":  15.70},  # Arthur
            {"player_id": 2, "lucro":   1.75},  # Rafael
            {"player_id": 3, "lucro":   3.20},  # Mateus
            {"player_id": 4, "lucro":  -8.70},  # Guilherme
            {"player_id": 5, "lucro":  -9.00},  # Lucas
            {"player_id": 6, "lucro":  -9.00},  # Oswaldo
            {"player_id": 8, "lucro":   6.05},  # Kauã
        ],
    },
    {
        "date": "2026-02-28",
        "buy_in": 9.90,
        "players": [
            {"player_id": 7, "lucro": -10.08},  # Julia
            {"player_id": 4, "lucro": -10.08},  # Guilherme
            {"player_id": 5, "lucro":  -8.48},  # Lucas
            {"player_id": 9, "lucro":   4.02},  # Victor
            {"player_id": 2, "lucro":   4.52},  # Rafael
            {"player_id": 3, "lucro":  20.10},  # Mateus (ajuste de R$0,02 de arredondamento)
        ],
    },
]


def calc_settlements(balances):
    cr = sorted([b for b in balances if b["balance"] > 0], key=lambda x: -x["balance"])
    dr = sorted([b for b in balances if b["balance"] < 0], key=lambda x:  x["balance"])
    cr = [dict(b) for b in cr]
    dr = [dict(b) for b in dr]
    txs = []
    ci, di = 0, 0
    while ci < len(cr) and di < len(dr):
        amount = min(cr[ci]["balance"], -dr[di]["balance"])
        if amount > 0.005:
            txs.append({
                "from_player": dr[di]["player_id"],
                "to_player":   cr[ci]["player_id"],
                "amount":      round(amount, 2),
            })
        cr[ci]["balance"] -= amount
        dr[di]["balance"] += amount
        if abs(cr[ci]["balance"]) < 0.005: ci += 1
        if abs(dr[di]["balance"]) < 0.005: di += 1
    return txs


db = SessionLocal()

# Verifica se já existe histórico
if db.query(Session).count() > 0:
    print("Sessões já existem no banco. Seed ignorado.")
    db.close()
    sys.exit(0)

for s_data in SESSIONS:
    session = Session(
        date=s_data["date"],
        buy_in=s_data["buy_in"],
        chip_value=CHIP_VALUE,
        status="closed",
    )
    db.add(session)
    db.flush()  # gera o id

    balances = []
    for p in s_data["players"]:
        chips_end = CHIPS_BASE + round(p["lucro"] / CHIP_VALUE, 4)
        entry = Entry(
            session_id=session.id,
            player_id=p["player_id"],
            chips_start=CHIPS_BASE,
            chips_end=chips_end,
        )
        db.add(entry)
        balances.append({"player_id": p["player_id"], "balance": p["lucro"]})

    for tx in calc_settlements(balances):
        db.add(Settlement(session_id=session.id, **tx))

    print(f"✓ Sessão {s_data['date']} criada com {len(s_data['players'])} jogadores")

db.commit()
db.close()
print("Histórico populado com sucesso!")
