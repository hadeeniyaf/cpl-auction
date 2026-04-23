import { useState, useEffect } from "react";

// Excel export function
function downloadExcel(players, teams) {
  const rows = [];
  
  // Title
  rows.push(["CPL 2026 PLAYER AUCTION - FINAL RESULTS"]);
  rows.push(["Date", new Date().toLocaleString()]);
  rows.push([]);

  // Summary Stats
  rows.push(["AUCTION SUMMARY"]);
  const soldPlayers = players.filter(p => p.soldTo && p.soldTo !== "UNSOLD");
  const unsoldPlayers = players.filter(p => p.soldTo === "UNSOLD");
  const totalRevenue = soldPlayers.reduce((acc, p) => acc + p.soldFor, 0);
  
  rows.push(["Total Players Available", players.length]);
  rows.push(["Players Sold", soldPlayers.length]);
  rows.push(["Players Unsold", unsoldPlayers.length]);
  rows.push(["Total Revenue Generated", `₹${totalRevenue}`]);
  rows.push([]);

  // Team Squads
  rows.push(["TEAM FINAL SQUADS"]);
  rows.push([]);
  
  teams.forEach(t => {
    rows.push([`${t.name.toUpperCase()} (Manager: ${t.manager})`]);
    rows.push(["Player", "Position", "Category", "Purchased Price", "Age"]);
    
    // Manager player
    rows.push([t.managerPlayer + " (MANAGER PLAYER)", "-", "-", t.managerValue, "-"]);
    
    // Bought players
    t.squad.forEach(p => {
      rows.push([p.name, p.position, p.category, p.soldFor, p.age]);
    });
    
    const spent = 5000 - t.budget;
    rows.push(["", "", "TOTAL SPENT", spent, ""]);
    rows.push(["", "", "BUDGET REMAINING", t.budget, ""]);
    rows.push([]);
  });

  rows.push([]);

  // All Transactions
  rows.push(["COMPLETE AUCTION LOG (ALL PLAYERS)"]);
  rows.push(["#", "Player Name", "Age", "Position", "Category", "Base Price", "Sold For", "Team", "Difference"]);
  
  players.forEach((p, idx) => {
    if (p.soldTo && p.soldTo !== "UNSOLD") {
      const team = teams.find(t => t.id === p.soldTo);
      const diff = p.soldFor - p.basePrice;
      rows.push([
        idx + 1,
        p.name,
        p.age,
        p.position,
        p.category,
        p.basePrice,
        p.soldFor,
        team ? team.name : "-",
        diff > 0 ? "+" + diff : diff === 0 ? "=" : diff
      ]);
    }
  });

  rows.push([]);
  rows.push(["UNSOLD PLAYERS"]);
  rows.push(["Player Name", "Age", "Position", "Category", "Base Price"]);
  unsoldPlayers.forEach(p => {
    rows.push([p.name, p.age, p.position, p.category, p.basePrice]);
  });

  // CSV conversion
  const csv = rows.map(row => 
    row.map(cell => {
      const str = String(cell || "");
      return str.includes(",") ? `"${str}"` : str;
    }).join(",")
  ).join("\n");

  // Trigger download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `CPL_Auction_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const TEAMS = [
  { id: "lamasia", name: "LA MASIA", managerPlayer: "Saiful", manager: "Naji", managerValue: 80, color: "#e63946" },
  { id: "homestead", name: "HOMESTEAD UNITED", managerPlayer: "Sreeshnu", manager: "Areef", managerValue: 70, color: "#2a9d8f" },
  { id: "fclagos", name: "FC LAGOS", managerPlayer: "Riju", manager: "Cherappu", managerValue: 70, color: "#e9c46a" },
  { id: "boca", name: "BOCA JUNIOR", managerPlayer: "Semee", manager: "Ameer", managerValue: 70, color: "#f4a261" },
  { id: "galacticos", name: "GALACTICOS FC", managerPlayer: "Subhan", manager: "Ashraf Nani", managerValue: 100, color: "#a8dadc" },
  { id: "athletic", name: "ATHLETIC FC", managerPlayer: "Fazil", manager: "Irshad", managerValue: 80, color: "#c77dff" },
];

const TOTAL_BUDGET = 5000;

// Categories
const CAT = { ICON: "Icon", FORWARD: "Forward", MIDFIELDER: "Midfielder", DEFENDER: "Defender", GK: "Goalkeeper", YOUNG: "Young" };
const BASE_PRICE = { [CAT.ICON]: 500, [CAT.FORWARD]: 200, [CAT.MIDFIELDER]: 200, [CAT.DEFENDER]: 200, [CAT.GK]: 200, [CAT.YOUNG]: 100 };
const CAT_COLOR = {
  [CAT.ICON]: "#ffd700",
  [CAT.FORWARD]: "#ef233c",
  [CAT.MIDFIELDER]: "#4cc9f0",
  [CAT.DEFENDER]: "#80b918",
  [CAT.GK]: "#f77f00",
  [CAT.YOUNG]: "#b5838d",
};

const ICON_NAMES = ["HANOON JAVAD C","Anees","Hadee Niyaf","Muhammad shahil tp","Shihab Ansil","Nusaif","AJIL MC","Hisham K","Favaz","Safvan","Mahroos","FASIL AMEEN T P"];

function getCategory(name, position, age) {
  const normName = name.trim().toLowerCase();
  if (ICON_NAMES.some(n => n.toLowerCase() === normName)) return CAT.ICON;
  if (age <= 18) return CAT.YOUNG;
  if (position === "Goal Keeper") return CAT.GK;
  if (position === "Forward") return CAT.FORWARD;
  if (position === "Midfielder") return CAT.MIDFIELDER;
  if (position === "Defender") return CAT.DEFENDER;
  return CAT.DEFENDER;
}

const RAW_PLAYERS = [
  { name: "HANOON JAVAD C", age: 21, position: "Forward" },
  { name: "SADIQUE ALI K", age: 26, position: "Defender" },
  { name: "Nasmal", age: 26, position: "Defender" },
  { name: "FASEEH MUHAMMAD", age: 23, position: "Goal Keeper" },
  { name: "Mahroos", age: 25, position: "Defender" },
  { name: "Senee Rihab", age: 20, position: "Forward" },
  { name: "muhammed Ahraf", age: 25, position: "Forward" },
  { name: "Afraz Hussain", age: 20, position: "Forward" },
  { name: "Anees", age: 21, position: "Midfielder" },
  { name: "Rabah hussain", age: 21, position: "Defender" },
  { name: "ALEEM", age: 22, position: "Forward" },
  { name: "Anfas p", age: 19, position: "Defender" },
  { name: "Sufiyan mk", age: 21, position: "Forward" },
  { name: "Hamdan Mohammed", age: 21, position: "Defender" },
  { name: "Hadee Niyaf", age: 22, position: "Midfielder" },
  { name: "Arshad Paara", age: 25, position: "Forward" },
  { name: "Mohammed shaheed TK", age: 35, position: "Midfielder" },
  { name: "Abdullah zubair", age: 18, position: "Midfielder" },
  { name: "ASHMIL. C", age: 20, position: "Midfielder" },
  { name: "Rejee Nashath", age: 26, position: "Defender" },
  { name: "Shakeeb", age: 29, position: "Goal Keeper" },
  { name: "Mohammed Sinan n", age: 19, position: "Midfielder" },
  { name: "Muhammad shahil tp", age: 18, position: "Forward" },
  { name: "Muhammed Alsabith", age: 18, position: "Midfielder" },
  { name: "Shihab Ansil", age: 24, position: "Defender" },
  { name: "Muhammad Nihal k", age: 17, position: "Midfielder" },
  { name: "Muhammad Sanfas v", age: 18, position: "Defender" },
  { name: "Shanid PP", age: 22, position: "Goal Keeper" },
  { name: "Muhammed Ashique.P", age: 18, position: "Forward" },
  { name: "Muhammed juhaif", age: 19, position: "Defender" },
  { name: "Nusaif", age: 26, position: "Forward" },
  { name: "Muhammed nihal. N", age: 21, position: "Defender" },
  { name: "Zemi", age: 16, position: "Midfielder" },
  { name: "Irfanul Azeez", age: 26, position: "Defender" },
  { name: "Muhammed Nisar", age: 16, position: "Defender" },
  { name: "Muhsin TP", age: 32, position: "Defender" },
  { name: "Shabeeh mk", age: 18, position: "Midfielder" },
  { name: "Shahinsha AP", age: 22, position: "Defender" },
  { name: "Ameen", age: 21, position: "Defender" },
  { name: "Safvan", age: 29, position: "Forward" },
  { name: "Ihsan syed mc", age: 20, position: "Defender" },
  { name: "Nufais", age: 23, position: "Forward" },
  { name: "Muhammad siyas k", age: 19, position: "Midfielder" },
  { name: "Fadil hanan p", age: 20, position: "Goal Keeper" },
  { name: "Zulfi", age: 33, position: "Defender" },
  { name: "Rashid.k", age: 21, position: "Defender" },
  { name: "Afnas N", age: 17, position: "Midfielder" },
  { name: "Shuhaibmk", age: 17, position: "Midfielder" },
  { name: "AJIL MC", age: 23, position: "Defender" },
  { name: "ABDUL MUHSIN", age: 31, position: "Defender" },
  { name: "Ajnas Junu", age: 29, position: "Midfielder" },
  { name: "Sinan mk", age: 18, position: "Goal Keeper" },
  { name: "KUTTU", age: 33, position: "Defender" },
  { name: "Muhammed aman", age: 16, position: "Midfielder" },
  { name: "FASIL AMEEN T P", age: 25, position: "Defender" },
  { name: "Aswanth KC", age: 24, position: "Forward" },
  { name: "Muhammad Risal", age: 17, position: "Defender" },
  { name: "Suhail c", age: 34, position: "Midfielder" },
  { name: "Muhammed Rizwan", age: 17, position: "Midfielder" },
  { name: "Favaz", age: 29, position: "Midfielder" },
  { name: "RADHIN K", age: 16, position: "Goal Keeper" },
  { name: "Hisham K", age: 25, position: "Forward" },
];

const PLAYERS = RAW_PLAYERS.map((p, i) => ({
  id: i + 1,
  name: p.name,
  age: p.age,
  position: p.position,
  category: getCategory(p.name, p.position, p.age),
  basePrice: BASE_PRICE[getCategory(p.name, p.position, p.age)],
  soldTo: null,
  soldFor: null,
}));

const CAT_ORDER = [CAT.ICON, CAT.GK, CAT.DEFENDER, CAT.MIDFIELDER, CAT.FORWARD, CAT.YOUNG];
const SORTED_PLAYERS = [...PLAYERS].sort((a, b) => CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category));

const STORAGE_KEY = "cpl_auction_data";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [view, setView] = useState("auction");
  const [log, setLog] = useState([]);
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlayers(data.players || SORTED_PLAYERS);
        setTeams(data.teams || TEAMS.map(t => ({ ...t, budget: TOTAL_BUDGET - t.managerValue, squad: [] })));
        setLog(data.log || []);
      } catch (e) {
        // Fallback to defaults
        setPlayers(SORTED_PLAYERS);
        setTeams(TEAMS.map(t => ({ ...t, budget: TOTAL_BUDGET - t.managerValue, squad: [] })));
        setLog([]);
      }
    } else {
      setPlayers(SORTED_PLAYERS);
      setTeams(TEAMS.map(t => ({ ...t, budget: TOTAL_BUDGET - t.managerValue, squad: [] })));
      setLog([]);
    }
  }, []);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    const data = { players, teams, log };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [players, teams, log]);

  const unsoldPlayers = players.filter(p => p.soldTo === null);
  const currentPlayer = unsoldPlayers[currentIdx] || null;

  useEffect(() => {
    if (currentPlayer) setBidAmount(currentPlayer.basePrice);
  }, [currentIdx, players, currentPlayer]);

  function sellPlayer() {
    if (!selectedTeam || !bidAmount) return;
    const team = teams.find(t => t.id === selectedTeam);
    if (!team) return;
    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount < currentPlayer.basePrice) {
      alert(`Minimum bid is ₹${currentPlayer.basePrice}`);
      return;
    }
    if (amount > team.budget) {
      alert(`${team.name} only has ₹${team.budget} remaining!`);
      return;
    }

    setTeams(prev => prev.map(t =>
      t.id === selectedTeam
        ? { ...t, budget: t.budget - amount, squad: [...t.squad, { ...currentPlayer, soldFor: amount }] }
        : t
    ));
    setPlayers(prev => prev.map(p =>
      p.id === currentPlayer.id ? { ...p, soldTo: selectedTeam, soldFor: amount } : p
    ));
    setLog(prev => [{ player: currentPlayer.name, team: team.name, amount, cat: currentPlayer.category }, ...prev]);
    setSelectedTeam("");
    setBidAmount("");
    const remaining = unsoldPlayers.filter(p => p.id !== currentPlayer.id);
    if (currentIdx >= remaining.length) setCurrentIdx(Math.max(0, remaining.length - 1));
  }

  function markUnsold() {
    setPlayers(prev => prev.map(p =>
      p.id === currentPlayer.id ? { ...p, soldTo: "UNSOLD" } : p
    ));
    const remaining = unsoldPlayers.filter(p => p.id !== currentPlayer.id);
    if (currentIdx >= remaining.length) setCurrentIdx(Math.max(0, remaining.length - 1));
  }

  function skipPlayer() {
    setCurrentIdx(i => (i + 1) % Math.max(1, unsoldPlayers.length));
  }

  function resetAuction() {
    localStorage.removeItem(STORAGE_KEY);
    setPlayers(SORTED_PLAYERS);
    setTeams(TEAMS.map(t => ({ ...t, budget: TOTAL_BUDGET - t.managerValue, squad: [] })));
    setLog([]);
    setCurrentIdx(0);
    setShowResetModal(false);
  }

  const filteredPlayers = players.filter(p => {
    const catMatch = filterCat === "All" || p.category === filterCat;
    const searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const soldCount = players.filter(p => p.soldTo && p.soldTo !== "UNSOLD").length;
  const unsoldCount = players.filter(p => p.soldTo === "UNSOLD").length;
  const remainingCount = players.filter(p => !p.soldTo).length;

  return (
    <div style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .body-text { font-family: 'Barlow', sans-serif; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; }
        .tab-btn { background: transparent; border: none; color: #888; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 2px; padding: 10px 20px; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab-btn.active { color: #fff; border-bottom: 2px solid #e63946; }
        .tab-btn:hover { color: #fff; }
        .bid-btn { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; font-size: 1.1rem; padding: 12px 28px; border: none; cursor: pointer; border-radius: 4px; transition: all 0.15s; }
        .bid-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .bid-btn:active { transform: translateY(0); }
        .team-card { border-radius: 8px; padding: 16px; background: #111827; border: 1px solid #1f2937; transition: all 0.2s; }
        .team-card:hover { border-color: #374151; }
        .player-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 6px; background: #111; margin-bottom: 4px; font-family: 'Barlow', sans-serif; font-size: 0.9rem; transition: background 0.15s; }
        .player-row:hover { background: #1a1a2e; }
        .cat-badge { font-family: 'Bebas Neue', sans-serif; font-size: 0.7rem; letter-spacing: 1px; padding: 2px 8px; border-radius: 20px; }
        input[type=number], select { background: #1a1a2e; border: 1px solid #2d2d4e; color: #fff; border-radius: 6px; padding: 10px 14px; font-family: 'Barlow', sans-serif; font-size: 1rem; outline: none; width: 100%; }
        input[type=number]:focus, select:focus { border-color: #e63946; }
        select option { background: #1a1a2e; }
        input[type=text] { background: #1a1a2e; border: 1px solid #2d2d4e; color: #fff; border-radius: 6px; padding: 10px 14px; font-family: 'Barlow', sans-serif; font-size: 1rem; outline: none; }
        input[type=text]:focus { border-color: #e63946; }
        .glow { box-shadow: 0 0 20px rgba(230, 57, 70, 0.3); }
        .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z: 1000; }
        .modal-content { background: #0d0d1a; border: 1px solid #2d2d4e; border-radius: 10px; padding: 30px; max-width: 400px; text-align: center; }
        .modal-content h2 { margin-bottom: 10px; font-family: 'Bebas Neue'; font-size: 1.5rem; }
        .modal-content p { color: #888; margin-bottom: 20px; font-family: 'Barlow'; }
        .modal-btns { display: flex; gap: 10px; }
        .modal-btns button { flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-family: 'Bebas Neue'; letter-spacing: 1px; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #1a0a0a 100%)", borderBottom: "1px solid #1f1f3a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "2rem", letterSpacing: "4px", color: "#e63946" }}>CPL 2026</div>
          <div className="body-text" style={{ fontSize: "0.75rem", color: "#666", letterSpacing: "2px" }}>PLAYER AUCTION TRACKER</div>
        </div>
        <div style={{ display: "flex", gap: "24px", textAlign: "center" }} className="body-text">
          <div><div style={{ fontSize: "1.4rem", color: "#4cc9f0" }}>{soldCount}</div><div style={{ fontSize: "0.65rem", color: "#555", letterSpacing: "1px" }}>SOLD</div></div>
          <div><div style={{ fontSize: "1.4rem", color: "#ffd700" }}>{remainingCount}</div><div style={{ fontSize: "0.65rem", color: "#555", letterSpacing: "1px" }}>REMAINING</div></div>
          <div><div style={{ fontSize: "1.4rem", color: "#888" }}>{unsoldCount}</div><div style={{ fontSize: "0.65rem", color: "#555", letterSpacing: "1px" }}>UNSOLD</div></div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {(soldCount > 0 || unsoldCount > 0) && (
            <button className="bid-btn" style={{ background: "#4cc9f0", color: "#000" }} onClick={() => downloadExcel(players, teams)}>
              📥 EXPORT CSV
            </button>
          )}
          <button className="bid-btn" style={{ background: "#333", color: "#888" }} onClick={() => setShowResetModal(true)}>
            🔄 RESET
          </button>
        </div>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>RESET AUCTION?</h2>
            <p>This will clear all auction data and start fresh. This cannot be undone.</p>
            <div className="modal-btns">
              <button onClick={() => setShowResetModal(false)} style={{ background: "#333", color: "#fff" }}>CANCEL</button>
              <button onClick={resetAuction} style={{ background: "#e63946", color: "#fff" }}>RESET</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #1f1f3a", padding: "0 24px", display: "flex", gap: "4px" }}>
        {["auction", "squads", "players"].map(v => (
          <button key={v} className={`tab-btn ${view === v ? "active" : ""}`} onClick={() => setView(v)}>
            {v === "auction" ? "⚡ AUCTION" : v === "squads" ? "🛡️ SQUADS" : "📋 ALL PLAYERS"}
          </button>
        ))}
      </div>

      {/* AUCTION VIEW */}
      {view === "auction" && (
        <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
          {/* Hero Section - Current Player */}
          {currentPlayer ? (
            <div style={{ background: "linear-gradient(135deg, #0d0d1a, #1a0a1a)", border: "1px solid #2d1f3a", borderRadius: "16px", padding: "40px", marginBottom: "32px", position: "relative", overflow: "hidden" }} className="glow">
              <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "300px", background: `radial-gradient(circle, ${CAT_COLOR[currentPlayer.category]}15, transparent)`, pointerEvents: "none" }}></div>
              
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "32px", alignItems: "center", position: "relative" }}>
                {/* Player Avatar */}
                <div style={{ width: "140px", height: "140px", borderRadius: "12px", background: `linear-gradient(135deg, ${CAT_COLOR[currentPlayer.category]}33, ${CAT_COLOR[currentPlayer.category]}11)`, border: `2px solid ${CAT_COLOR[currentPlayer.category]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                  👤
                </div>

                {/* Player Info */}
                <div>
                  <div style={{ fontSize: "0.75rem", letterSpacing: "3px", color: "#666", marginBottom: "8px" }} className="body-text">NOW UP FOR AUCTION</div>
                  <div style={{ fontSize: "3.5rem", letterSpacing: "2px", lineHeight: 1, color: currentPlayer.category === CAT.ICON ? "#ffd700" : "#fff", marginBottom: "12px", fontWeight: "700" }}>
                    {currentPlayer.name.toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ background: CAT_COLOR[currentPlayer.category], color: "#000", padding: "6px 18px", borderRadius: "24px", fontSize: "0.85rem", letterSpacing: "1px", fontWeight: "700" }} className="body-text">
                      {currentPlayer.category === CAT.ICON && "⭐ "}
                      {currentPlayer.category}
                    </div>
                    <div className="body-text" style={{ color: "#888", fontSize: "0.95rem" }}>Age: {currentPlayer.age}</div>
                    <div className="body-text" style={{ color: "#888", fontSize: "0.95rem" }}>• {currentPlayer.position}</div>
                    <div className="body-text" style={{ color: "#444", fontSize: "0.85rem", marginLeft: "auto" }}>Player #{currentPlayer.id} of {players.length}</div>
                  </div>
                </div>

                {/* Base Price */}
                <div style={{ background: "#0a0a0f", borderRadius: "12px", padding: "24px", textAlign: "center", minWidth: "180px", border: "1px solid #1f1f3a" }}>
                  <div className="body-text" style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "2px", marginBottom: "8px" }}>BASE PRICE</div>
                  <div style={{ fontSize: "2.8rem", color: "#ffd700", fontWeight: "700", lineHeight: 1 }}>₹{currentPlayer.basePrice}</div>
                </div>
              </div>

              {/* Bid Controls */}
              <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "16px", alignItems: "end" }}>
                <div>
                  <div className="body-text" style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "1px", marginBottom: "8px" }}>BID AMOUNT (₹)</div>
                  <input type="number" value={bidAmount} min={currentPlayer.basePrice} step={50}
                    onChange={e => setBidAmount(e.target.value)} placeholder={`Min ₹${currentPlayer.basePrice}`} 
                    style={{ fontSize: "1.1rem", padding: "14px" }} />
                </div>
                <div>
                  <div className="body-text" style={{ color: "#555", fontSize: "0.75rem", letterSpacing: "1px", marginBottom: "8px" }}>WINNING TEAM</div>
                  <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} style={{ fontSize: "1rem", padding: "14px" }}>
                    <option value="">Select Team...</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id} disabled={t.budget < currentPlayer.basePrice}>
                        {t.name} (₹{t.budget} left)
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button className="bid-btn" style={{ background: "#e63946", color: "#fff", flex: 2, fontSize: "1.2rem", padding: "14px" }} onClick={sellPlayer}>
                    🏷️ SOLD
                  </button>
                  <button className="bid-btn" style={{ background: "#1f2937", color: "#888", flex: 1 }} onClick={markUnsold}>
                    UNSOLD
                  </button>
                  <button className="bid-btn" style={{ background: "#1f2937", color: "#4cc9f0", flex: 1 }} onClick={skipPlayer}>
                    SKIP →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: "#0d0d1a", border: "1px solid #1f1f3a", borderRadius: "16px", padding: "80px", textAlign: "center", marginBottom: "32px" }}>
              <div style={{ fontSize: "3rem", color: "#4cc9f0", marginBottom: "12px" }}>🏆 AUCTION COMPLETE</div>
              <div className="body-text" style={{ color: "#666", fontSize: "1.1rem" }}>All players have been processed</div>
            </div>
          )}

          {/* Team Budget Cards - Horizontal */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "1.1rem", letterSpacing: "3px", color: "#555", marginBottom: "16px" }}>TEAM BUDGETS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {teams.map(t => {
                const pct = (t.budget / TOTAL_BUDGET) * 100;
                return (
                  <div key={t.id} className="team-card" style={{ borderTop: `3px solid ${t.color}`, textAlign: "center" }}>
                    <div style={{ fontSize: "0.95rem", letterSpacing: "1px", marginBottom: "4px" }}>{t.name}</div>
                    <div className="body-text" style={{ color: "#555", fontSize: "0.7rem", marginBottom: "8px" }}>{t.managerPlayer}</div>
                    <div className="body-text" style={{ fontSize: "1.6rem", color: pct < 20 ? "#e63946" : pct < 40 ? "#f77f00" : "#4cc9f0", fontWeight: "700", marginBottom: "8px" }}>₹{t.budget}</div>
                    <div className="body-text" style={{ color: "#666", fontSize: "0.75rem", marginBottom: "8px" }}>{t.squad.length} players</div>
                    <div style={{ background: "#0a0a0f", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                      <div style={{ background: t.color, height: "100%", width: `${pct}%`, transition: "width 0.5s ease", borderRadius: "4px" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Sales */}
          <div>
            <div style={{ fontSize: "1.1rem", letterSpacing: "3px", color: "#555", marginBottom: "16px" }}>RECENT SALES</div>
            <div style={{ background: "#0d0d1a", border: "1px solid #1f1f3a", borderRadius: "12px", padding: "16px", maxHeight: "300px", overflowY: "auto" }}>
              {log.length === 0 && <div className="body-text" style={{ color: "#333", fontSize: "0.9rem", textAlign: "center", padding: "24px" }}>No sales yet</div>}
              <div style={{ display: "grid", gap: "8px" }}>
                {log.map((l, i) => {
                  const team = teams.find(t => t.name === l.team);
                  const player = players.find(p => p.name === l.player);
                  return (
                    <div key={i} className="player-row" style={{ background: "#111", padding: "12px" }}>
                      <div style={{ background: CAT_COLOR[l.cat], width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.95rem", marginBottom: "2px" }}>{l.player}</div>
                        <div className="body-text" style={{ color: "#555", fontSize: "0.75rem" }}>{player?.position || ""} • Age {player?.age || ""}</div>
                      </div>
                      <div className="body-text" style={{ color: team?.color || "#888", fontSize: "0.85rem", marginRight: "12px" }}>{l.team}</div>
                      <div style={{ color: "#ffd700", fontWeight: "700", fontSize: "1rem" }}>₹{l.amount}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQUADS VIEW */}
      {view === "squads" && (
        <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {teams.map(t => (
              <div key={t.id} style={{ background: "#0d0d1a", border: `1px solid ${t.color}33`, borderTop: `3px solid ${t.color}`, borderRadius: "10px", padding: "20px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "1.3rem", letterSpacing: "2px" }}>{t.name}</div>
                  <div className="body-text" style={{ color: "#666", fontSize: "0.75rem", letterSpacing: "1px" }}>MGR PLAYER: {t.managerPlayer} · MANAGER: {t.manager}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                    <div className="body-text" style={{ fontSize: "0.8rem", color: "#888" }}>{t.squad.length + 1} players (incl. mgr)</div>
                    <div className="body-text" style={{ fontSize: "0.85rem", color: "#4cc9f0", fontWeight: "700" }}>₹{t.budget} left</div>
                  </div>
                  <div className="body-text" style={{ fontSize: "0.75rem", color: "#555", marginTop: "2px" }}>
                    Spent: ₹{TOTAL_BUDGET - t.budget} / ₹{TOTAL_BUDGET}
                  </div>
                </div>

                {/* Manager player */}
                <div className="player-row" style={{ background: `${t.color}15`, borderLeft: `2px solid ${t.color}` }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.85rem" }}>{t.managerPlayer}</span>
                    <span className="body-text" style={{ color: "#555", fontSize: "0.75rem", marginLeft: "8px" }}>Manager Player</span>
                  </div>
                  <div style={{ color: "#888", fontSize: "0.8rem" }}>₹{t.managerValue}</div>
                </div>

                {t.squad.length === 0 && (
                  <div className="body-text" style={{ color: "#333", textAlign: "center", padding: "16px", fontSize: "0.85rem" }}>No players yet</div>
                )}
                {t.squad.map((p, i) => (
                  <div key={i} className="player-row">
                    <div style={{ background: CAT_COLOR[p.category], width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.85rem" }}>{p.name}</div>
                      <div className="body-text" style={{ color: "#555", fontSize: "0.72rem" }}>{p.category} · Age {p.age}</div>
                    </div>
                    <div style={{ color: "#ffd700", fontSize: "0.8rem" }}>₹{p.soldFor}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL PLAYERS VIEW */}
      {view === "players" && (
        <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input type="text" placeholder="Search player..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: "180px" }} />
            {["All", ...CAT_ORDER].map(c => (
              <button key={c} onClick={() => setFilterCat(c)} className="body-text"
                style={{ background: filterCat === c ? CAT_COLOR[c] || "#e63946" : "#111", color: filterCat === c ? "#000" : "#888", border: "none", borderRadius: "20px", padding: "6px 16px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", transition: "all 0.15s" }}>
                {c}
              </button>
            ))}
          </div>

          {/* Stats bar */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
            {CAT_ORDER.map(c => {
              const count = players.filter(p => p.category === c).length;
              const sold = players.filter(p => p.category === c && p.soldTo && p.soldTo !== "UNSOLD").length;
              return (
                <div key={c} className="body-text" style={{ background: "#111", borderRadius: "8px", padding: "8px 14px", borderLeft: `3px solid ${CAT_COLOR[c]}` }}>
                  <div style={{ fontSize: "0.65rem", color: "#555", letterSpacing: "1px" }}>{c.toUpperCase()}</div>
                  <div style={{ fontSize: "1rem", color: "#fff" }}>{sold}/{count}</div>
                </div>
              );
            })}
          </div>

          <div>
            {filteredPlayers.map(p => {
              const soldTeam = p.soldTo && p.soldTo !== "UNSOLD" ? teams.find(t => t.id === p.soldTo) : null;
              return (
                <div key={p.id} className="player-row" style={{ background: p.soldTo === "UNSOLD" ? "#0d0a0a" : p.soldTo ? "#0a0d0a" : "#111", opacity: p.soldTo === "UNSOLD" ? 0.5 : 1 }}>
                  <div style={{ width: "28px", color: "#333", fontSize: "0.8rem", textAlign: "center" }} className="body-text">{p.id}</div>
                  <div style={{ background: CAT_COLOR[p.category], width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 }}></div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.9rem" }}>{p.name}</span>
                    <span className="body-text" style={{ color: "#555", fontSize: "0.75rem", marginLeft: "8px" }}>Age {p.age}</span>
                  </div>
                  <div className="body-text" style={{ color: "#555", fontSize: "0.8rem", width: "80px" }}>{p.position}</div>
                  <div style={{ width: "80px" }}>
                    <span className="cat-badge body-text" style={{ background: `${CAT_COLOR[p.category]}22`, color: CAT_COLOR[p.category] }}>{p.category}</span>
                  </div>
                  <div className="body-text" style={{ width: "60px", textAlign: "right", color: "#888", fontSize: "0.8rem" }}>₹{p.basePrice}</div>
                  <div className="body-text" style={{ width: "120px", textAlign: "right", fontSize: "0.8rem" }}>
                    {p.soldTo === "UNSOLD" && <span style={{ color: "#444" }}>UNSOLD</span>}
                    {soldTeam && <span style={{ color: soldTeam.color }}>● {soldTeam.name.split(" ")[0]}</span>}
                    {soldTeam && <span style={{ color: "#ffd700", marginLeft: "6px" }}>₹{p.soldFor}</span>}
                    {!p.soldTo && <span style={{ color: "#333" }}>—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
