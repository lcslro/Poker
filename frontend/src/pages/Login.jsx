import { useState } from "react";
import { G } from "../styles";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: G.bg }}>
      <div style={{ width: 360, textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: "0 auto 24px",
          background: `linear-gradient(135deg, ${G.green}, ${G.greenLt})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
        }}>♣</div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: G.gold, marginBottom: 8 }}>
          PokerNight
        </h1>
        <p style={{ color: G.textMuted, fontSize: 13, marginBottom: 32 }}>Gerenciador de partidas</p>

        <div className="card" style={{ textAlign: "left" }}>
          <div style={{ marginBottom: 16 }}>
            <label className="label">E-mail</label>
            <input className="input" type="email" placeholder="seu@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="label">Senha</label>
            <input className="input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          {error && <p style={{ color: G.redLt, fontSize: 12, marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleLogin} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        <p style={{ color: G.textMuted, fontSize: 12, marginTop: 20 }}>
          Acesso restrito aos jogadores cadastrados
        </p>
      </div>
    </div>
  );
}
