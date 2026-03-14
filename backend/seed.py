"""
Seed inicial do banco de dados.
Executa na pasta backend: python seed.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine
from app.models import Base, Player
from app.routers.auth import hash_password

Base.metadata.create_all(bind=engine)

PLAYERS = [
    {"name": "Arthur",    "email": "arthur@poker.local",    "is_admin": False},
    {"name": "Rafael",    "email": "rafael@poker.local",    "is_admin": False},
    {"name": "Mateus",    "email": "mateus@poker.local",    "is_admin": False},
    {"name": "Guilherme", "email": "guilherme@poker.local", "is_admin": False},
    {"name": "Lucas",     "email": "lucas@poker.local",     "is_admin": True},
    {"name": "Oswaldo",   "email": "oswaldo@poker.local",   "is_admin": False},
    {"name": "Julia",     "email": "julia@poker.local",     "is_admin": False},
    {"name": "Kauã",      "email": "kaua@poker.local",      "is_admin": False},
    {"name": "Victor",    "email": "victor@poker.local",    "is_admin": False},
]

DEFAULT_PASSWORD = "poker123"

db = SessionLocal()

existing = db.query(Player).count()
if existing > 0:
    print(f"Banco já tem {existing} jogadores. Seed ignorado.")
    db.close()
    sys.exit(0)

for p in PLAYERS:
    player = Player(
        name=p["name"],
        email=p["email"],
        hashed_password=hash_password(DEFAULT_PASSWORD),
        is_admin=p["is_admin"],
    )
    db.add(player)

db.commit()
db.close()

print(f"✓ {len(PLAYERS)} jogadores criados com senha '{DEFAULT_PASSWORD}'")
print("  Admin: lucas@poker.local")
