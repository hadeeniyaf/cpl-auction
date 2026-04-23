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
  { id: "lamasia", name: "LA MASIA", managerPlayer: "Saiful Islam", manager: "Naji", managerValue: 80, color: "#e63946", logo: "laMasia.png" },
  { id: "homestead", name: "HOMESTEAD UNITED", managerPlayer: "Sreeshnu P", manager: "Areef", managerValue: 70, color: "#2a9d8f", logo: "homestead United.png" },
  { id: "fclagos", name: "FC LAGOS", managerPlayer: "Riju", manager: "Cherappu", managerValue: 70, color: "#e9c46a", logo: "fcLagos.png" },
  { id: "boca", name: "BOCA JUNIOR", managerPlayer: "Semee Najath", manager: "Ameer", managerValue: 70, color: "#f4a261", logo: "bocaJunior.png" },
  { id: "galacticos", name: "GALACTICOS FC", managerPlayer: "Subuhan Ali", manager: "Ashraf Nani", managerValue: 100, color: "#a8dadc", logo: "galacticosFc.png" },
  { id: "athletic", name: "ATHLETIC FC", managerPlayer: "Fazil Nottan", manager: "Irshad", managerValue: 80, color: "#c77dff", logo: "athletic-fc.png" },
];

const TOTAL_BUDGET = 2000;

// Categories
const CAT = { ICON: "Icon", FORWARD: "Forward", MIDFIELDER: "Midfielder", DEFENDER: "Defender", GK: "Goalkeeper", YOUNG: "Young" };
const BASE_PRICE = { [CAT.ICON]: 60, [CAT.FORWARD]: 35, [CAT.MIDFIELDER]: 35, [CAT.DEFENDER]: 35, [CAT.GK]: 35, [CAT.YOUNG]: 20 };
const CAT_COLOR = {
  [CAT.ICON]: "#ffd700",
  [CAT.FORWARD]: "#ef233c",
  [CAT.MIDFIELDER]: "#4cc9f0",
  [CAT.DEFENDER]: "#80b918",
  [CAT.GK]: "#f77f00",
  [CAT.YOUNG]: "#b5838d",
};

const ICON_NAMES = ["HANOON JAVAD C","Anees","Hadee Niyaf","Asar","Shihab Ansil","Nusaif","AJIL MC","Hisham Kodi","Favaz","Safvan","Mahroos","FASIL AMEEN T P"];

function getCategory(name, position, age) {
  const normName = name.trim().toLowerCase();
  if (ICON_NAMES.some(n => n.toLowerCase() === normName)) return CAT.ICON;
  // Force Radhin K and Sinan mk to be Goalkeepers
  if (normName === "radhin k" || normName === "sinan mk") return CAT.GK;
  if (position === "Goal Keeper") return CAT.GK;
  if (age <= 18) return CAT.YOUNG;
  if (position === "Forward") return CAT.FORWARD;
  if (position === "Midfielder") return CAT.MIDFIELDER;
  if (position === "Defender") return CAT.DEFENDER;
  return CAT.DEFENDER;
}

const RAW_PLAYERS = [
  { id: "CPL002", name: "HANOON JAVAD C", age: 21, position: "Forward", image: "CPL002.jpg" },
  { id: "CPL003", name: "SADIQUE ALI K", age: 26, position: "Defender", image: "CPL003.jpeg" },
  { id: "CPL004", name: "Nasmal", age: 26, position: "Defender", image: "CPL004.jpeg" },
  { id: "CPL006", name: "FASEEH MUHAMMAD", age: 23, position: "Goal Keeper", image: "CPL006.jpeg" },
  { id: "CPL007", name: "Mahroos", age: 25, position: "Defender", image: "CPL007.jpeg" },
  { id: "CPL009", name: "Senee Rihab", age: 20, position: "Forward", image: "CPL009.png" },
  { id: "CPL010", name: "muhammed Ahraf", age: 25, position: "Forward", image: "CPL010.jpeg" },
  { id: "CPL011", name: "Afraz Hussain", age: 20, position: "Forward", image: "CPL011.jpeg" },
  { id: "CPL012", name: "Anees", age: 21, position: "Midfielder", image: "CPL012.jpg" },
  { id: "CPL014", name: "Rabah hussain", age: 21, position: "Defender", image: "CPL014.jpg" },
  { id: "CPL015", name: "ALEEM", age: 22, position: "Forward", image: "CPL015.png" },
  { id: "CPL016", name: "Anfas p", age: 19, position: "Forward", image: "CPL016.jpeg" },
  { id: "CPL017", name: "Sufiyan mk", age: 21, position: "Forward", image: "CPL017.jpg" },
  { id: "CPL018", name: "Hamdan Mohammed", age: 21, position: "Defender", image: "CPL018.jpg" },
  { id: "CPL019", name: "Hadee Niyaf", age: 22, position: "Midfielder", image: "CPL019.png" },
  { id: "CPL021", name: "Arshad Paara", age: 25, position: "Forward", image: "CPL021.png" },
  { id: "CPL022", name: "Mohammed shaheed TK", age: 35, position: "Midfielder", image: "CPL022.jpg" },
  { id: "CPL023", name: "Abdullah zubair", age: 18, position: "Midfielder", image: "CPL023.png" },
  { id: "CPL024", name: "ASHMIL. C", age: 20, position: "Midfielder", image: "CPL024.jpg" },
  { id: "CPL025", name: "Rejee Nashath", age: 26, position: "Defender", image: "CPL025.jpeg" },
  { id: "CPL026", name: "Shakeeb", age: 29, position: "Goal Keeper", image: "CPL026.jpeg" },
  { id: "CPL027", name: "Mohammed Sinan n", age: 19, position: "Midfielder", image: "CPL027.jpeg" },
  { id: "CPL028", name: "Muhammad shahil tp", age: 18, position: "Forward", image: "CPL028.jpg" },
  { id: "CPL029", name: "Muhammed Alsabith", age: 18, position: "Midfielder", image: "CPL029.jpeg" },
  { id: "CPL030", name: "Shihab Ansil", age: 24, position: "Defender", image: "CPL030.jpeg" },
  { id: "CPL032", name: "Muhammad Nihal k", age: 17, position: "Midfielder", image: "CPL032.jpg" },
  { id: "CPL033", name: "Muhammad Sanfas v", age: 18, position: "Defender", image: "CPL033.jpg" },
  { id: "CPL034", name: "Shanid PP", age: 22, position: "Goal Keeper", image: "CPL034.png" },
  { id: "CPL035", name: "Muhammed Ashique.P", age: 18, position: "Forward", image: "CPL035.png" },
  { id: "CPL036", name: "Muhammed juhaif", age: 19, position: "Defender", image: "CPL036.jpg" },
  { id: "CPL037", name: "Nusaif", age: 26, position: "Forward", image: "CPL037.jpeg" },
  { id: "CPL038", name: "Muhammed nihal. N", age: 21, position: "Defender", image: "CPL038.jpg" },
  { id: "CPL039", name: "Zemi", age: 16, position: "Midfielder", image: "CPL039.jpg" },
  { id: "CPL040", name: "Irfanul Azeez", age: 26, position: "Defender", image: "CPL040.jpeg" },
  { id: "CPL041", name: "Muhammed Nisar", age: 16, position: "Defender", image: "CPL041.jpg" },
  { id: "CPL042", name: "Muhsin TP", age: 32, position: "Defender", image: "CPL042.jpg" },
  { id: "CPL043", name: "Shabeeh mk", age: 18, position: "Midfielder", image: "CPL043.jpg" },
  { id: "CPL044", name: "Shahinsha AP", age: 22, position: "Defender", image: "CPL044.jpg" },
  { id: "CPL045", name: "Ameen", age: 21, position: "Defender", image: "CPL045.jpg" },
  { id: "CPL046", name: "Safvan", age: 29, position: "Forward", image: "CPL046.jpeg" },
  { id: "CPL047", name: "Ihsan syed mc", age: 20, position: "Defender", image: "CPL047.png" },
  { id: "CPL048", name: "Nufais", age: 23, position: "Forward", image: "CPL048.jpeg" },
  { id: "CPL049", name: "Muhammad siyas k", age: 19, position: "Midfielder", image: "CPL049.jpg" },
  { id: "CPL050", name: "Fadil hanan p", age: 20, position: "Goal Keeper", image: "CPL050.jpg" },
  { id: "CPL051", name: "Zulfi", age: 33, position: "Defender", image: "CPL051.png" },
  { id: "CPL052", name: "Rashid.k", age: 21, position: "Defender", image: "CPL052.jpeg" },
  { id: "CPL053", name: "Afnas N", age: 17, position: "Midfielder", image: "CPL053.jpg" },
  { id: "CPL054", name: "Shuhaibmk", age: 17, position: "Midfielder", image: "CPL054.jpg" },
  { id: "CPL055", name: "AJIL MC", age: 23, position: "Defender", image: "CPL055.jpeg" },
  { id: "CPL056", name: "ABDUL MUHSIN", age: 31, position: "Defender", image: "CPL056.jpeg" },
  { id: "CPL057", name: "Ajnas Junu", age: 29, position: "Midfielder", image: "CPL057.jpeg" },
  { id: "CPL058", name: "Sinan mk", age: 18, position: "Goal Keeper", image: "CPL058.png" },
  { id: "CPL059", name: "KUTTU", age: 33, position: "Defender", image: "CPL059.jpeg" },
  { id: "CPL060", name: "Muhammed aman", age: 16, position: "Midfielder", image: "CPL060.jpg" },
  { id: "CPL061", name: "FASIL AMEEN T P", age: 25, position: "Defender", image: "CPL061.jpg" },
  { id: "CPL062", name: "Aswanth KC", age: 24, position: "Forward", image: "CPL062.png" },
  { id: "CPL063", name: "Muhammad Risal", age: 17, position: "Defender", image: "CPL063.jpg" },
  { id: "CPL064", name: "Suhail c", age: 34, position: "Midfielder", image: "CPL064.jpg" },
  { id: "CPL065", name: "Muhammed Rizwan", age: 17, position: "Midfielder", image: "CPL065.jpg" },
  { id: "CPL066", name: "Favaz", age: 29, position: "Midfielder", image: "CPL066.jpeg" },
  { id: "CPL067", name: "RADHIN K", age: 16, position: "Goal Keeper", image: "CPL067.jpg" },
  { id: "CPL068", name: "Anshad Thayatheel", age: 32, position: "Defender", image: "CPL068.jpeg" },
  { id: "CPL069", name: "MOHAMMED SADIQALI K", age: 31, position: "Defender", image: "CPL069.jpeg" },
  { id: "CPL070", name: "Asar", age: 31, position: "Defender", image: "CPL070.jpeg" },
  { id: "CPL071", name: "Haneefa", age: 34, position: "Forward", image: "CPL071.jpeg" },
];

const PLAYERS = RAW_PLAYERS.map((p) => ({
  id: p.id,
  name: p.name,
  age: p.age,
  position: p.position,
  category: getCategory(p.name, p.position, p.age),
  basePrice: BASE_PRICE[getCategory(p.name, p.position, p.age)],
  soldTo: null,
  soldFor: null,
  image: p.image,
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
  const [teamBids, setTeamBids] = useState({});
  const [lastBidder, setLastBidder] = useState(null);
  const [view, setView] = useState("auction");
  const [log, setLog] = useState([]);
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldPlayerData, setSoldPlayerData] = useState(null);
  const [actionHistory, setActionHistory] = useState([]);

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
    if (currentPlayer) {
      setBidAmount(currentPlayer.basePrice);
      setTeamBids({});
      setLastBidder(null);
    }
  }, [currentIdx, players, currentPlayer]);

  function getBidIncrement(currentBid) {
    if (currentBid < 150) return 5;
    if (currentBid <= 250) return 10;
    return 20;
  }

  function placeBid(teamId) {
    if (!currentPlayer) return;
    
    // Prevent same team from bidding twice consecutively
    if (lastBidder === teamId) {
      alert('Another team must bid before you can bid again!');
      return;
    }
    
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    
    // First bid for the player is base price, all subsequent bids increment from current highest
    let newBid;
    
    if (bidAmount === currentPlayer.basePrice && Object.keys(teamBids).length === 0) {
      // Very first bid for this player - use base price
      newBid = currentPlayer.basePrice;
    } else {
      // Any subsequent bid - increment based on current highest bid
      const increment = getBidIncrement(bidAmount);
      newBid = bidAmount + increment;
    }
    
    if (newBid > team.budget) {
      alert(`${team.name} only has ₹${team.budget} remaining!`);
      return;
    }
    
    setTeamBids(prev => ({ ...prev, [teamId]: newBid }));
    setBidAmount(newBid);
    setSelectedTeam(teamId);
    setLastBidder(teamId);
  }

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

    // Save state for undo
    const undoAction = {
      type: 'SELL',
      player: { ...currentPlayer },
      team: selectedTeam,
      amount: amount,
      previousPlayers: players,
      previousTeams: teams,
      previousLog: log,
      previousIdx: currentIdx,
      timestamp: Date.now()
    };

    setTeams(prev => prev.map(t =>
      t.id === selectedTeam
        ? { ...t, budget: t.budget - amount, squad: [...t.squad, { ...currentPlayer, soldFor: amount }] }
        : t
    ));
    setPlayers(prev => prev.map(p =>
      p.id === currentPlayer.id ? { ...p, soldTo: selectedTeam, soldFor: amount } : p
    ));
    setLog(prev => [{ player: currentPlayer.name, team: team.name, amount, cat: currentPlayer.category }, ...prev]);
    
    // Show sold modal
    setSoldPlayerData({
      player: currentPlayer,
      team: team,
      amount: amount
    });
    setShowSoldModal(true);
    
    // Add to action history (keep last 10)
    setActionHistory(prev => [undoAction, ...prev].slice(0, 10));
    
    setSelectedTeam("");
    setBidAmount("");
    setTeamBids({});
    setLastBidder(null);
    const remaining = unsoldPlayers.filter(p => p.id !== currentPlayer.id);
    if (currentIdx >= remaining.length) setCurrentIdx(Math.max(0, remaining.length - 1));
  }

  function undoLastAction() {
    if (actionHistory.length === 0) {
      alert('No actions to undo!');
      return;
    }

    const lastAction = actionHistory[0];
    
    // Restore previous state
    setPlayers(lastAction.previousPlayers);
    setTeams(lastAction.previousTeams);
    setLog(lastAction.previousLog);
    setCurrentIdx(lastAction.previousIdx);
    
    // Remove from history
    setActionHistory(prev => prev.slice(1));
    
    // Reset current bid state
    setSelectedTeam("");
    setBidAmount(lastAction.player.basePrice);
    setTeamBids({});
    setLastBidder(null);
  }

  
  function skipPlayer() {
    if (!currentPlayer) return;
    
    // Get all unsold players in current category
    const currentCategory = currentPlayer.category;
    const categoryPlayers = unsoldPlayers.filter(p => p.category === currentCategory);
    const currentCategoryIdx = categoryPlayers.findIndex(p => p.id === currentPlayer.id);
    
    if (currentCategoryIdx < categoryPlayers.length - 1) {
      // More players in current category - shuffle to next in category
      const nextInCategory = categoryPlayers[currentCategoryIdx + 1];
      const nextIdx = unsoldPlayers.findIndex(p => p.id === nextInCategory.id);
      setCurrentIdx(nextIdx);
    } else {
      // Last player in category - move to next category
      const catOrder = [CAT.ICON, CAT.FORWARD, CAT.MIDFIELDER, CAT.DEFENDER, CAT.GK, CAT.YOUNG];
      const currentCatIdx = catOrder.indexOf(currentCategory);
      
      // Find next category with unsold players
      let nextCategory = null;
      for (let i = currentCatIdx + 1; i < catOrder.length; i++) {
        const playersInCat = unsoldPlayers.filter(p => p.category === catOrder[i]);
        if (playersInCat.length > 0) {
          nextCategory = catOrder[i];
          break;
        }
      }
      
      if (nextCategory) {
        // Move to first player of next category
        const nextCategoryPlayers = unsoldPlayers.filter(p => p.category === nextCategory);
        const nextIdx = unsoldPlayers.findIndex(p => p.id === nextCategoryPlayers[0].id);
        setCurrentIdx(nextIdx);
      } else {
        // No more categories - wrap to beginning
        setCurrentIdx(0);
      }
    }
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
        .sold-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .sold-modal-content { background: linear-gradient(135deg, #0d0d1a, #1a0a1a); border: 2px solid #e63946; border-radius: 16px; padding: 40px; max-width: 700px; text-align: center; position: relative; }
        .sold-modal-close { position: absolute; top: 15px; right: 15px; background: #1f2937; color: #fff; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; }
        .sold-modal-close:hover { background: #e63946; }
        .transfer-container { display: flex; align-items: center; justify-content: center; gap: 30px; margin: 30px 0; }
        .player-sold-img { width: 150px; height: 200px; border-radius: 12px; object-fit: cover; border: 3px solid #4cc9f0; }
        .triple-arrow { font-size: 3rem; color: #ffd700; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
        .team-logo-sold { width: 120px; height: 120px; object-fit: contain; border-radius: 12px; background: rgba(255,255,255,0.1); padding: 10px; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #1a0a0a 100%)", borderBottom: "1px solid #1f1f3a", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "1.3rem", letterSpacing: "3px", color: "#e63946" }}>CPL 2026</div>
          <div className="body-text" style={{ fontSize: "0.55rem", color: "#666", letterSpacing: "2px" }}>PLAYER AUCTION TRACKER</div>
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

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #1f1f3a", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px" }}>
          {["auction", "squads", "players"].map(v => (
            <button key={v} className="bid-btn" style={{ background: view === v ? "#4cc9f0" : "#1f2937", color: view === v ? "#000" : "#fff" }} onClick={() => setView(v)}>
              {v === "auction" ? "⚡ AUCTION" : v === "squads" ? "🛡️ SQUADS" : "📋 ALL PLAYERS"}
            </button>
          ))}
        </div>
        <button 
          className="bid-btn" 
          style={{ background: actionHistory.length > 0 ? "#f77f00" : "#555", color: "#fff", opacity: actionHistory.length > 0 ? 1 : 0.5 }} 
          onClick={undoLastAction}
          disabled={actionHistory.length === 0}
        >
          ↶ UNDO ({actionHistory.length})
        </button>
      </div>

      {/* AUCTION VIEW */}
      {view === "auction" && (
        <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
          {/* Hero Section - Current Player */}
          {currentPlayer ? (
            <div style={{ background: "linear-gradient(135deg, #0d0d1a, #1a0a1a)", border: "1px solid #2d1f3a", borderRadius: "12px", padding: "24px", marginBottom: "24px", position: "relative", overflow: "hidden" }} className="glow">
              <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "200px", background: `radial-gradient(circle, ${CAT_COLOR[currentPlayer.category]}15, transparent)`, pointerEvents: "none" }}></div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "24px", alignItems: "center", position: "relative" }}>
                {/* Player Info - Left */}
                <div>
                  <div style={{ fontSize: "0.65rem", letterSpacing: "2px", color: "#666", marginBottom: "6px" }} className="body-text">NOW UP FOR AUCTION</div>
                  <div style={{ fontSize: "3.3rem", letterSpacing: "2px", lineHeight: 1.1, color: currentPlayer.category === CAT.ICON ? "#ffd700" : "#fff", marginBottom: "10px", fontWeight: "700" }}>
                    {currentPlayer.name.toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ background: CAT_COLOR[currentPlayer.category], color: "#000", padding: "4px 14px", borderRadius: "20px", fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "700" }} className="body-text">
                      {currentPlayer.category === CAT.ICON && "⭐ "}
                      {currentPlayer.category}
                    </div>
                    <div className="body-text" style={{ color: "#888", fontSize: "0.85rem" }}>Age: {currentPlayer.age}</div>
                    <div className="body-text" style={{ color: "#888", fontSize: "0.85rem" }}>• {currentPlayer.position}</div>
                  </div>
                </div>

                {/* Player Avatar - Center */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <button className="bid-btn" style={{ background: "#1f2937", color: "#4cc9f0", padding: "12px 24px" }} onClick={skipPlayer}>
                    SKIP
                  </button>
                  <div style={{ width: "180px", height: "240px", borderRadius: "12px", background: `linear-gradient(135deg, ${CAT_COLOR[currentPlayer.category]}33, ${CAT_COLOR[currentPlayer.category]}11)`, border: `3px solid ${CAT_COLOR[currentPlayer.category]}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {currentPlayer.image ? (
                      <img 
                        src={`/players-photos/${currentPlayer.image}`} 
                        alt={currentPlayer.name}
                        onError={(e) => {
                          // Show fallback on error
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent && !parent.querySelector('.fallback-avatar')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'fallback-avatar';
                            fallback.style.fontSize = '6rem';
                            fallback.textContent = '👤';
                            parent.appendChild(fallback);
                          }
                        }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ fontSize: "6rem" }}>👤</div>
                    )}
                  </div>
                  <button className="bid-btn" style={{ background: "#e63946", color: "#fff", fontSize: "1.1rem", padding: "12px 24px" }} onClick={sellPlayer} disabled={!selectedTeam}>
                    SOLD
                  </button>
                </div>

                {/* Current Bid - Right */}
                <div style={{ textAlign: "right" }}>
                  <div className="body-text" style={{ color: "#555", fontSize: "0.65rem", letterSpacing: "2px", marginBottom: "6px" }}>CURRENT BID</div>
                  <div style={{ fontSize: "3.75rem", color: "#ffd700", fontWeight: "700", lineHeight: 1, marginBottom: "6px" }}>₹{bidAmount}</div>
                  {selectedTeam && (
                    <div style={{ fontSize: "1.1rem", color: teams.find(t => t.id === selectedTeam)?.color || "#fff", fontWeight: "700", marginBottom: "8px" }}>
                      {teams.find(t => t.id === selectedTeam)?.name}
                    </div>
                  )}
                  <div className="body-text" style={{ color: "#444", fontSize: "0.75rem" }}>Base: ₹{currentPlayer.basePrice}</div>
                  <div className="body-text" style={{ color: "#444", fontSize: "0.75rem" }}>Player {currentPlayer.id}</div>
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
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "1rem", letterSpacing: "3px", color: "#555", marginBottom: "12px" }}>TEAM BUDGETS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }}>
              {teams.map(t => {
                const pct = (t.budget / TOTAL_BUDGET) * 100;
                const currentBid = teamBids[t.id] || currentPlayer?.basePrice || 0;
                const isHighestBidder = selectedTeam === t.id;
                return (
                  <div key={t.id} className="team-card" style={{ borderTop: `3px solid ${t.color}`, textAlign: "center", background: isHighestBidder ? `${t.color}11` : "#111827", border: isHighestBidder ? `2px solid ${t.color}` : "1px solid #1f2937" }}>
                    <div style={{ fontSize: "0.8rem", letterSpacing: "1px", marginBottom: "4px" }}>{t.name}</div>
                    <div className="body-text" style={{ color: "#555", fontSize: "0.65rem", marginBottom: "6px" }}>{t.managerPlayer}</div>
                    <div className="body-text" style={{ fontSize: "1.3rem", color: pct < 20 ? "#e63946" : pct < 40 ? "#f77f00" : "#4cc9f0", fontWeight: "700", marginBottom: "6px" }}>₹{t.budget}</div>
                    <div className="body-text" style={{ color: "#666", fontSize: "0.7rem", marginBottom: "6px" }}>{t.squad.length} players</div>
                    {currentPlayer && (
                      <button 
                        className="bid-btn" 
                        style={{ 
                          background: isHighestBidder ? t.color : lastBidder === t.id ? "#555" : "#1f2937", 
                          color: isHighestBidder ? "#000" : "#fff", 
                          fontSize: "0.85rem", 
                          padding: "8px 12px", 
                          width: "100%",
                          marginBottom: "6px",
                          opacity: lastBidder === t.id ? 0.5 : 1,
                          cursor: lastBidder === t.id ? "not-allowed" : "pointer"
                        }} 
                        onClick={() => placeBid(t.id)}
                        disabled={lastBidder === t.id}
                      >
                        {isHighestBidder ? `₹${currentBid}` : lastBidder === t.id ? 'WAIT' : (bidAmount === currentPlayer.basePrice && Object.keys(teamBids).length === 0) ? `BID ₹${currentPlayer.basePrice}` : `BID +${getBidIncrement(bidAmount)}`}
                      </button>
                    )}
                    <div style={{ background: "#0a0a0f", borderRadius: "4px", height: "4px", overflow: "hidden" }}>
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

      {/* Sold Player Modal */}
      {showSoldModal && soldPlayerData && (
        <div className="sold-modal" onClick={() => setShowSoldModal(false)}>
          <div className="sold-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="sold-modal-close" onClick={() => setShowSoldModal(false)}>×</button>
            
            <div style={{ fontSize: "2.5rem", color: "#4cc9f0", fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px", marginBottom: "10px" }}>
              ⚡ DEAL DONE ⚡
            </div>
            
            <div className="transfer-container">
              {/* Player Image */}
              <div style={{ textAlign: "center" }}>
                {soldPlayerData.player.image ? (
                  <img 
                    src={`/players-photos/${soldPlayerData.player.image}`} 
                    alt={soldPlayerData.player.name}
                    className="player-sold-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent && !parent.querySelector('.fallback-sold')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'fallback-sold';
                        fallback.style.cssText = 'width: 150px; height: 200px; border-radius: 12px; border: 3px solid #4cc9f0; display: flex; align-items: center; justify-content: center; font-size: 4rem; background: linear-gradient(135deg, #1a1a2e, #0d0d1a);';
                        fallback.textContent = '👤';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div style={{ width: "150px", height: "200px", borderRadius: "12px", border: "3px solid #4cc9f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", background: "linear-gradient(135deg, #1a1a2e, #0d0d1a)" }}>👤</div>
                )}
                <div style={{ fontSize: "1.2rem", color: "#fff", marginTop: "10px", fontFamily: "'Bebas Neue', cursive" }}>
                  {soldPlayerData.player.name}
                </div>
              </div>

              {/* Triple Arrow */}
              <div className="triple-arrow">⇉⇉⇉</div>

              {/* Team Logo */}
              <div style={{ textAlign: "center" }}>
                <img 
                  src={`/team-logo/${soldPlayerData.team.logo}`} 
                  alt={soldPlayerData.team.name}
                  className="team-logo-sold"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent && !parent.querySelector('.fallback-logo')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-logo';
                      fallback.style.cssText = `width: 120px; height: 120px; border-radius: 12px; background: ${soldPlayerData.team.color}; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #000; font-weight: bold;`;
                      fallback.textContent = soldPlayerData.team.name.substring(0, 2);
                      parent.appendChild(fallback);
                    }
                  }}
                />
                <div style={{ fontSize: "1.2rem", color: soldPlayerData.team.color, marginTop: "10px", fontFamily: "'Bebas Neue', cursive", fontWeight: "700" }}>
                  {soldPlayerData.team.name}
                </div>
              </div>
            </div>

            {/* Price */}
            <div style={{ fontSize: "3rem", color: "#ffd700", fontFamily: "'Bebas Neue', cursive", marginTop: "20px" }}>
              ₹{soldPlayerData.amount}
            </div>
            
            <div className="body-text" style={{ color: "#888", fontSize: "0.9rem", marginTop: "10px" }}>
              {soldPlayerData.player.position} • {soldPlayerData.player.category} • Age {soldPlayerData.player.age}
            </div>

            <button 
              className="bid-btn" 
              style={{ background: "#4cc9f0", color: "#000", marginTop: "30px", padding: "12px 40px", fontSize: "1.1rem" }}
              onClick={() => setShowSoldModal(false)}
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
