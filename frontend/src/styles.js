export const G = {
  bg:       "#0a0e0a",
  surface:  "#111611",
  card:     "#161d16",
  border:   "#1f2e1f",
  green:    "#2d6a2d",
  greenLt:  "#3a8c3a",
  gold:     "#c9a84c",
  goldLt:   "#e8c96a",
  text:     "#e8e8e0",
  textMuted:"#7a8a7a",
  red:      "#c0392b",
  redLt:    "#e74c3c",
  chip:     "#1a261a",
};

export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${G.bg};
    color: ${G.text};
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${G.bg}; }
  ::-webkit-scrollbar-thumb { background: ${G.green}; border-radius: 2px; }

  .felt-texture {
    background-image:
      repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(45,106,45,0.03) 2px, rgba(45,106,45,0.03) 4px),
      repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(45,106,45,0.03) 2px, rgba(45,106,45,0.03) 4px);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.3); }
    50%       { box-shadow: 0 0 0 6px rgba(201,168,76,0); }
  }

  .anim-fade { animation: fadeUp 0.4s ease forwards; }
  .anim-fade:nth-child(2) { animation-delay: 0.06s; opacity:0; }
  .anim-fade:nth-child(3) { animation-delay: 0.12s; opacity:0; }
  .anim-fade:nth-child(4) { animation-delay: 0.18s; opacity:0; }
  .anim-fade:nth-child(5) { animation-delay: 0.24s; opacity:0; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    transition: all 0.18s ease; white-space: nowrap;
  }
  .btn-primary {
    background: linear-gradient(135deg, ${G.green}, ${G.greenLt});
    color: #fff;
    box-shadow: 0 2px 12px rgba(45,106,45,0.35);
  }
  .btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); }
  .btn-gold {
    background: linear-gradient(135deg, ${G.gold}, ${G.goldLt});
    color: ${G.bg};
    box-shadow: 0 2px 12px rgba(201,168,76,0.3);
    animation: pulse 2.5s infinite;
  }
  .btn-gold:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .btn-ghost {
    background: transparent; color: ${G.textMuted};
    border: 1px solid ${G.border};
  }
  .btn-ghost:hover { border-color: ${G.green}; color: ${G.text}; }
  .btn-danger {
    background: rgba(192,57,43,0.15); color: ${G.redLt};
    border: 1px solid rgba(192,57,43,0.3);
  }
  .btn-danger:hover { background: rgba(192,57,43,0.25); }
  .btn-sm { padding: 6px 12px; font-size: 12px; }

  .input {
    background: ${G.chip}; border: 1px solid ${G.border}; color: ${G.text};
    padding: 10px 14px; border-radius: 8px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; width: 100%; transition: border-color 0.15s;
    outline: none;
  }
  .input:focus { border-color: ${G.green}; }
  .input::placeholder { color: ${G.textMuted}; }

  .label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; color: ${G.textMuted}; margin-bottom: 6px;
    display: block;
  }

  .card {
    background: ${G.card}; border: 1px solid ${G.border};
    border-radius: 12px; padding: 20px;
  }

  .tag {
    display: inline-flex; align-items: center; padding: 3px 10px;
    border-radius: 20px; font-size: 11px; font-weight: 500; letter-spacing: 0.04em;
  }
  .tag-green { background: rgba(45,106,45,0.2); color: ${G.greenLt}; border: 1px solid rgba(45,106,45,0.3); }
  .tag-gold  { background: rgba(201,168,76,0.15); color: ${G.gold}; border: 1px solid rgba(201,168,76,0.25); }
  .tag-red   { background: rgba(192,57,43,0.15); color: ${G.redLt}; border: 1px solid rgba(192,57,43,0.25); }
  .tag-gray  { background: rgba(255,255,255,0.05); color: ${G.textMuted}; border: 1px solid ${G.border}; }

  .divider { border: none; border-top: 1px solid ${G.border}; }

  /* ── Layout ── */
  .main-content {
    flex: 1;
    margin-left: 220px;
    padding: 32px 36px;
    min-height: 100vh;
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 220px;
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    z-index: 100;
    display: flex;
    flex-direction: column;
    padding: 0 0 20px 0;
  }
  .sidebar-logo { padding: 28px 24px 20px; }
  .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; }
  .sidebar-suits { padding: 0 24px; display: flex; gap: 8px; opacity: 0.3; }

  .sidebar-btn {
    width: 100%; display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 8px; border: none; cursor: pointer;
    text-align: left; font-family: 'DM Sans', sans-serif; font-size: 14px;
    font-weight: 400; transition: all 0.15s; margin-bottom: 4px;
    border-left: 2px solid transparent;
  }
  .sidebar-btn.active { font-weight: 500; }
  .sidebar-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
  .sidebar-label {}

  /* ── Responsive grids ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .two-col-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .players-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .players-form { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end; }
  .table-scroll { overflow-x: auto; }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .main-content { margin-left: 0 !important; padding: 20px 16px 76px !important; }

    .sidebar {
      width: 100% !important;
      height: 60px !important;
      top: auto !important; bottom: 0 !important;
      flex-direction: row !important;
      padding: 0 !important;
      border-right: none !important;
      border-top: 1px solid ${G.border} !important;
    }
    .sidebar-logo { display: none !important; }
    .sidebar-suits { display: none !important; }
    .sidebar-nav {
      flex-direction: row !important;
      padding: 0 !important;
      flex: 1 !important;
    }
    .sidebar-btn {
      flex-direction: column !important;
      gap: 2px !important;
      padding: 6px 4px !important;
      font-size: 10px !important;
      flex: 1 !important;
      border-radius: 0 !important;
      margin-bottom: 0 !important;
      border-left: none !important;
      border-top: 2px solid transparent !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .sidebar-btn.active { border-left: none !important; border-top: 2px solid ${G.greenLt} !important; }
    .sidebar-icon { font-size: 18px !important; width: auto !important; }

    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .two-col-grid { grid-template-columns: 1fr !important; }
    .players-grid { grid-template-columns: 1fr !important; }
    .players-form { grid-template-columns: 1fr !important; }
  }
`;
