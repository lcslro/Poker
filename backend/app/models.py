from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .database import Base


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_admin = Column(Boolean, default=False)

    entries = relationship("Entry", back_populates="player")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    buy_in = Column(Float, nullable=False)
    chip_value = Column(Float, nullable=False, default=0.10)
    status = Column(String, default="active")  # active | closed

    entries = relationship("Entry", back_populates="session")
    settlements = relationship("Settlement", back_populates="session")


class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    chips_start = Column(Float, nullable=False)
    chips_end = Column(Float, nullable=True)
    reentries = Column(Float, nullable=False, default=0.0)

    session = relationship("Session", back_populates="entries")
    player = relationship("Player", back_populates="entries")


class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    from_player = Column(Integer, ForeignKey("players.id"), nullable=False)
    to_player = Column(Integer, ForeignKey("players.id"), nullable=False)
    amount = Column(Float, nullable=False)

    session = relationship("Session", back_populates="settlements")
