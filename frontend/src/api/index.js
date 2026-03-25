export const CHIP_VALUE = 0.10;

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.reload();
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Erro na requisição");
  }

  if (res.status === 204) return null;
  return res.json();
}

// --- Auth ---
export async function login(email, password) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch("/api/auth/login", { method: "POST", body });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erro ao fazer login" }));
    throw new Error(err.detail || "Erro ao fazer login");
  }
  return res.json();
}

// --- Players ---
export const getPlayers = () => apiFetch("/players/");
export const createPlayer = (name, email, password) =>
  apiFetch("/players/", { method: "POST", body: JSON.stringify({ name, email, password }) });

// --- Sessions ---
export const getSessions = () => apiFetch("/sessions/");
export const createSession = (date, buyIn) =>
  apiFetch("/sessions/", { method: "POST", body: JSON.stringify({ date, buy_in: buyIn, chip_value: CHIP_VALUE }) });
export const updateSession = (id, data) =>
  apiFetch(`/sessions/${id}`, { method: "PUT", body: JSON.stringify(data) });

// --- Entries ---
export const getEntries = (sessionId) => apiFetch(`/entries/session/${sessionId}`);
export const createEntry = (sessionId, playerId, chipsStart) =>
  apiFetch("/entries/", { method: "POST", body: JSON.stringify({ session_id: sessionId, player_id: playerId, chips_start: chipsStart }) });
export const updateEntry = (entryId, chipsEnd) =>
  apiFetch(`/entries/${entryId}`, { method: "PUT", body: JSON.stringify({ chips_end: chipsEnd }) });
export const addReentry = (entryId, chipsAdd) =>
  apiFetch(`/entries/${entryId}/reentry`, { method: "PATCH", body: JSON.stringify({ chips_add: chipsAdd }) });

// --- Settle ---
export const postSettle = (sessionId) => apiFetch(`/settle/${sessionId}`, { method: "POST" });
export const getSettle = (sessionId) => apiFetch(`/settle/${sessionId}`);

// --- Rankings ---
export const getRankings = () => apiFetch("/rankings/");
