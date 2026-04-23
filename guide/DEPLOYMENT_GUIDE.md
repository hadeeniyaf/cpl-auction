# CPL AUCTION TRACKER - LOCAL DEPLOYMENT GUIDE

---

## 🚀 QUICK START (3 Steps)

### Step 1: Get Node.js & Create React App
```bash
# Install Node.js from https://nodejs.org (v16 or higher)
# Then open terminal/command prompt and run:

npx create-react-app cpl-auction
cd cpl-auction
```

### Step 2: Replace the App Code
1. Open `src/App.jsx` in the `cpl-auction` folder
2. Delete all existing code
3. Copy-paste the entire code from **cpl_auction_v2.jsx** into this file

### Step 3: Run Locally
```bash
npm start
```

✅ App opens at `http://localhost:3000`

---

## 📱 HOW TO USE

### Before Auction Day
1. Run `npm start` to open app on localhost
2. Test all 3 views: Auction, Squads, Players
3. Click a SOLD button to test data persistence
4. Refresh page — your data should still be there ✓
5. Click EXPORT CSV and verify file downloads

### During Auction
1. **Auctioneer calls a player**
2. **Enter bid amount** in the input field
3. **Select winning team** from dropdown
4. **Click SOLD button**
   - Budget updates automatically
   - Player added to team's squad
   - Recent sales logged on right panel
5. App moves to next player or shows "AUCTION COMPLETE"

### After Auction
1. Review squads in **🛡️ SQUADS** tab
2. Check all players in **📋 ALL PLAYERS** tab
3. Click **📥 EXPORT CSV**
4. Opens file: `CPL_Auction_[DATE].csv`
5. Open in **Excel, Google Sheets, or Numbers**

---

## 💾 DATA STORAGE

### Where is My Data Saved?
✅ **Browser Local Storage** — Data saved automatically after each sale

### How to Back It Up?
1. After auction ends, click **📥 EXPORT CSV**
2. File downloads to your Downloads folder
3. Upload to Google Drive / OneDrive / Dropbox for backup

### What if I Lose Browser Data?
❌ If you clear browser cache, local storage is deleted
✅ Always export CSV at end of auction to keep records

### How to View Exported CSV
- **Excel:** Right-click CSV → Open with → Excel
- **Google Sheets:** Upload to Google Drive, open with Google Sheets
- **Numbers (Mac):** Right-click CSV → Open with → Numbers
- **Any Text Editor:** Open directly (tab-separated)

---

## 🔧 CUSTOMIZATION

### Change Budget Amount
In `cpl_auction_v2.jsx`, find this line:
```javascript
const TOTAL_BUDGET = 5000;
```
Change `5000` to your desired amount (e.g., `10000` for ₹10k)

### Change Team Names/Managers
Find this section:
```javascript
const TEAMS = [
  { id: "lamasia", name: "LA MASIA", managerPlayer: "Saiful", manager: "Naji", managerValue: 80, color: "#e63946" },
  // ... edit any team details here
];
```

### Add/Remove Teams
Add new object to TEAMS array:
```javascript
{ id: "newteam", name: "NEW TEAM", managerPlayer: "Player Name", manager: "Manager Name", managerValue: 100, color: "#ff00ff" },
```

### Change Base Prices
Find:
```javascript
const BASE_PRICE = { 
  [CAT.ICON]: 500,           // Change 500 to new icon price
  [CAT.FORWARD]: 200,        // Change 200 to new forward price
  [CAT.MIDFIELDER]: 200,
  [CAT.DEFENDER]: 200,
  [CAT.GK]: 200,
  [CAT.YOUNG]: 100           // Change 100 to new young price
};
```

---

## 🖥️ DISPLAY SETUP FOR AUCTION DAY

### Ideal Setup
1. **Main Screen (Projected):** Auction view showing current player
2. **Scorekeeper Laptop:** Same screen to update data
3. **Team Tables:** Each has paper/pen to track their squad

### For Single Laptop
- Full-screen auction view on projector
- Auctioneer/scorekeeper use same app (still works fine)

### For Multiple Screens
- Run app on one laptop, mirror to projector
- Managers can see live updates on their phones too (share localhost URL on local network)

---

## 🐛 TROUBLESHOOTING

### "npm command not found"
→ **Solution:** Node.js not installed. Download from https://nodejs.org and install

### "Port 3000 already in use"
→ **Solution:** Run `npm start -- --port 3001` instead

### App won't load data after refresh
→ **Solution:** Check browser console (F12) for errors. Try incognito mode.

### Export button not working
→ **Solution:** Check browser downloads folder. Ensure cookies/permissions allowed.

### Budget not updating
→ **Solution:** Clear browser cache (Ctrl+Shift+Delete) and refresh

### Players appear multiple times
→ **Solution:** Check if duplicates in RAW_PLAYERS array. Remove them.

### Projector shows blank screen
→ **Solution:** 
1. Refresh the page (Ctrl+R)
2. Maximize browser window (F11 for fullscreen)
3. Check if localhost:3000 is loaded

---

## 📊 READING THE EXPORTED CSV

### File Format
Tab-separated values. Open with Excel, Google Sheets, or any spreadsheet app.

### What's Included?

**Section 1: Auction Summary**
- Total players, sold, unsold
- Total revenue generated

**Section 2: Team Final Squads**
- Each team's complete roster
- Manager player listed with cost
- All purchased players with prices
- Total spent & budget remaining

**Section 3: Auction Log**
- Complete transaction history
- Player name, age, position, category
- Base price vs sold price
- Which team bought them
- Profit/loss from base price

**Section 4: Unsold Players**
- Players who received no bids
- Can be re-auctioned later

**Section 5: Category Statistics**
- How many players sold per category
- Average selling price per category

---

## 🎓 SAMPLE WORKFLOW

### 9:00 AM - Pre-Auction
```
1. Open laptop, run: npm start
2. App opens at localhost:3000
3. Projector shows AUCTION tab
4. All team budgets visible (right side)
5. Brief managers on rules
```

### 9:15 AM - Start Auction
```
Auctioneer: "We have Hanoon Javad C, Icon Forward, ₹500 base"
Manager 1: "₹550!"
Manager 2: "₹650!"
Manager 1: "₹700!"
Auctioneer: "Going once... twice... SOLD to LA MASIA for ₹700!"
Scorekeeper: Enters ₹700, selects LA MASIA, clicks SOLD
App updates: LA MASIA budget drops, Hanoon added to squad
```

### 12:00 PM - Auction Complete
```
1. All 62 players assigned
2. Click 🛡️ SQUADS tab to verify all teams have squads
3. Click 📥 EXPORT CSV
4. File saves to Downloads folder
5. Announce results
```

### 12:15 PM - Archive Results
```
1. Email CSV to all teams
2. Save CSV locally on multiple devices
3. Celebrate! 🎉
```

---

## 🔐 IMPORTANT NOTES

⚠️ **Data is stored LOCALLY in browser**
- If you use private/incognito mode, data won't persist
- Use normal mode for full persistence

⚠️ **Clearing browser cache deletes data**
- Always export CSV before clearing cache
- Keep CSV files backed up

⚠️ **Multiple windows/tabs**
- Each window has its own local storage
- Use same tab throughout auction
- Avoid opening app in new incognito window

---

## 📞 NEED HELP?

**Common Issues:**
1. Page loads but nothing shows → Refresh (Ctrl+R)
2. Budget not updating → Click SOLD button again
3. Can't download CSV → Check Downloads folder, check browser permissions
4. App crashes → Restart with `npm start`

**Advanced Issues:**
- Open browser console (F12 → Console) to see error messages
- Check Local Storage (F12 → Application → Local Storage)
- Try clearing cache and restarting: `npm start`

---

## ✅ PRE-AUCTION CHECKLIST

- [ ] Node.js installed
- [ ] Created React app with `npx create-react-app`
- [ ] Copied auction code into `src/App.jsx`
- [ ] App runs with `npm start` ✓
- [ ] Tested SOLD/UNSOLD/SKIP buttons
- [ ] Tested refresh (data persists)
- [ ] Tested CSV export
- [ ] CSV opens in Excel/Sheets correctly
- [ ] Projector/display tested
- [ ] Team budgets visible and correct
- [ ] All 68 players loaded
- [ ] Auctioneer briefed on workflow

---

## 🎉 YOU'RE READY!

Your CPL Auction Tracker is fully set up and ready to run.
Good luck with the auction! May the best teams win! ⚽🏆

---

**Questions?** Check the CPL_AUCTION_PLAN.md guide for detailed rules and workflow.
