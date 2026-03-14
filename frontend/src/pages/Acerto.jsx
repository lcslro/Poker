import { useState, useEffect } from "react";
import { G } from "../styles";
import { Avatar, MoneyBadge, Header } from "../components/UI";
import { getPlayers, getEntries, postSettle, getSettle, CHIP_VALUE } from "../api/index";

export default function Acerto({ activeSessionId, setActiveSessionId }) {
  const [balances, setBalances] = useState([]);
  const [txs, setTxs] = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSessionId) { setLoading(false); return; }

    async function load() {
      const [allPlayers, existingTxs, entries] = await Promise.all([
        getPlayers(),
        getSettle(activeSessionId),
        getEntries(activeSessionId),
      ]);
      // Balanços individuais
      const bal = entries
        .filter(e => e.chips_end != null)
        .map(e => {
          const p = allPlayers.find(p => p.id === e.player_id);
          const balance = Math.round((e.chips_end - e.chips_start) * CHIP_VALUE * 100) / 100;
          return { name: p?.name ?? "?", balance };
        });
      setBalances(bal);

      if (existingTxs.length > 0) {
        // Sessão já encerrada
        setTxs(existingTxs.map(tx => ({
          from: allPlayers.find(p => p.id === tx.from_player)?.name ?? "?",
          to: allPlayers.find(p => p.id === tx.to_player)?.name ?? "?",
          amount: tx.amount,
        })));
      } else {
        // Fechar sessão e calcular acerto
        const settled = await postSettle(activeSessionId);
        setTxs(settled.map(tx => ({
          from: allPlayers.find(p => p.id === tx.from_player)?.name ?? "?",
          to: allPlayers.find(p => p.id === tx.to_player)?.name ?? "?",
          amount: tx.amount,
        })));
        setActiveSessionId(null);
      }
      setLoading(false);
    }
    load();
  }, [activeSessionId]);

  const toggle = (i) => setConfirmed(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i]);
  const allDone = txs.length > 0 && confirmed.length === txs.length;

  if (loading) return <div style={{ color: G.textMuted, padding: 32 }}>Calculando acerto...</div>;

  if (!activeSessionId && txs.length === 0) return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <Header title="Acerto da Partida" subtitle="Algoritmo de transferências mínimas" />
      <p style={{ color: G.textMuted }}>Nenhuma partida em andamento. Inicie uma partida primeiro.</p>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.35s ease" }}>
      <Header
        title="Acerto da Partida"
        subtitle="Algoritmo de transferências mínimas"
        action={allDone ? <span className="tag tag-green" style={{ padding: "6px 14px", fontSize: 13 }}>✓ Acerto concluído!</span> : null}
      />

      {balances.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 24 }}>
          {balances.map(b => (
            <div key={b.name} className="card" style={{ textAlign: "center", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <Avatar letter={b.name[0]} size={32} />
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>{b.name}</div>
              <MoneyBadge value={b.balance} />
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          {txs.length === 0 ? "Nenhuma transferência necessária" : `${txs.length} transferências`}
        </div>

        {txs.length === 0 && <p style={{ color: G.textMuted, fontSize: 13 }}>Todos estão quites!</p>}

        {txs.map((tx, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "14px 16px", borderRadius: 10, marginBottom: 8,
            background: confirmed.includes(i) ? "rgba(45,106,45,0.1)" : G.chip,
            border: `1px solid ${confirmed.includes(i) ? "rgba(45,106,45,0.3)" : G.border}`,
            transition: "all 0.2s",
          }}>
            <Avatar letter={tx.from[0]} size={34} color="linear-gradient(135deg,#8b2020,#c0392b)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14 }}>
                <b>{tx.from}</b>
                <span style={{ color: G.textMuted, margin: "0 8px" }}>paga</span>
                <b>{tx.to}</b>
              </div>
              <div style={{ color: G.textMuted, fontSize: 11, marginTop: 2 }}>Transferência PIX ou dinheiro</div>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500, color: G.gold }}>
              R${tx.amount.toFixed(2)}
            </div>
            <button className={`btn btn-sm ${confirmed.includes(i) ? "btn-primary" : "btn-ghost"}`} onClick={() => toggle(i)}>
              {confirmed.includes(i) ? "✓ Pago" : "Confirmar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
