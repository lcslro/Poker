from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


# --- Auth ---

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Players ---

class PlayerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    is_admin: bool = False


class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_admin: Optional[bool] = None


class PlayerOut(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Sessions ---

class SessionCreate(BaseModel):
    date: str
    buy_in: float
    chip_value: float = 0.10


class SessionUpdate(BaseModel):
    status: Optional[str] = None
    buy_in: Optional[float] = None
    chip_value: Optional[float] = None


class SessionOut(BaseModel):
    id: int
    date: str
    buy_in: float
    chip_value: float
    status: str

    model_config = {"from_attributes": True}


# --- Entries ---

class EntryCreate(BaseModel):
    session_id: int
    player_id: int
    chips_start: float


class EntryUpdate(BaseModel):
    chips_end: float


class EntryOut(BaseModel):
    id: int
    session_id: int
    player_id: int
    chips_start: float
    chips_end: Optional[float] = None

    model_config = {"from_attributes": True}


# --- Settlements ---

class SettlementOut(BaseModel):
    id: int
    session_id: int
    from_player: int
    to_player: int
    amount: float

    model_config = {"from_attributes": True}


# --- Rankings ---

class PlayerRanking(BaseModel):
    player_id: int
    name: str
    sessions_played: int
    wins: int
    losses: int
    total_profit: float
    mvp_count: int = 0
