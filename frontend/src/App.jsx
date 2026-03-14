import { useState, useEffect } from "react";
import { globalCss, G } from "./styles";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Partida from "./pages/Partida";
import Acerto from "./pages/Acerto";
import Ranking from "./pages/Ranking";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Avatar, Header } from "./components/UI";
import { getPlayers, createPlayer } from "./api/index";

function Players() {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "poker123" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getPlayers().then(data => setPlayers(data.map(p => ({ ...p, avatar: p.name[0].toUpperCase() }))));
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const newPlayer = await createPlayer(form.name, form.email, form.password);
    setPlayers(prev => [...prev, { ...newPlayer, avatar: newPlayer.name[0].toUpperCase(), wins: 0, losses: 0, totalProfit: 0 }]);
    setForm({ name: "", email: "", password: "poker123" });
    setAdding(false);
  };

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <Header
        title="Jogadores"
        subtitle={`${players.length} jogadores cadastrados`}
        action={<button className="btn btn-primary" onClick={() => setAdding(a => !a)}>{adding ? "✕ Cancelar" : "+ Novo jogador"}</button>}
      />
      {adding && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, marginBottom: 16 }}>Novo jogador</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
            <div>
              <label className="label">Nome</label>
              <input className="input" placeholder="Nome do jogador" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input" placeholder="email@exemplo.com" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" placeholder="Senha" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>Adicionar</button>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {players.map((p) => (
          <div key={p.id} className="card anim-fade" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar letter={p.avatar} size={44} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: G.textMuted, marginTop: 2 }}>{p.email}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppInner() {
  const { token } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [activeSessionId, setActiveSessionId] = useState(null);

  if (!token) return (
    <>
      <style>{globalCss}</style>
      <Login />
    </>
  );

  const pages = {
    dashboard: <Dashboard setPage={setPage} />,
    session:   <Partida setPage={setPage} activeSessionId={activeSessionId} setActiveSessionId={setActiveSessionId} />,
    settle:    <Acerto activeSessionId={activeSessionId} setActiveSessionId={setActiveSessionId} />,
    ranking:   <Ranking />,
    players:   <Players />,
  };

  return (
    <>
      <style>{globalCss}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar page={page} setPage={setPage} />
        <main className="felt-texture" style={{ flex: 1, marginLeft: 220, padding: "32px 36px", minHeight: "100vh" }}>
          {pages[page]}
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
