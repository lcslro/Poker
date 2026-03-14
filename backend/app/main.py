from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from .database import Base, engine
from .routers import auth, entries, players, rankings, sessions, settle

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PokerNight API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(players.router)
app.include_router(sessions.router)
app.include_router(entries.router)
app.include_router(settle.router)
app.include_router(rankings.router)


@app.get("/")
def health():
    return {"status": "ok"}


# Handler para AWS Lambda
handler = Mangum(app)
