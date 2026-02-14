import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Area, AreaChart
} from "recharts";
import { supabase } from "./supabase";

// ─── Ohio State Color System ───
const C = {
  scarlet: "#BB0000", scarletDark: "#8B0000", scarletLight: "#D4342A",
  gray: "#666666", grayLight: "#A7B1B7", grayDark: "#343434",
  white: "#FFFFFF", offWhite: "#F5F3EF", warmCream: "#FAF8F5",
  gold: "#C8A951", goldSoft: "#FFF8E7", green: "#4CAF50", greenDark: "#2E7D32",
  orange: "#FF9800", blue: "#1976D2",
};

// ─── Kyle's REAL Historical Data ───
const historicalData = [
  { day: 1, weekday: "Tue", date: "Jul 29", amWt: 282.2, pmWt: null, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffee", lunch: "N/A", dinner: "12 Boneless at Trivia", postDinner: "N/A", other: "2 Diet Coke", water: "4 x 30 oz" },
  { day: 2, weekday: "Wed", date: "Jul 30", amWt: 278.4, pmWt: 280.2, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffee", lunch: "N/A", dinner: "Sobaba Chicken (2 servings) and pasta", postDinner: "", other: "", water: "2" },
  { day: 3, weekday: "Thu", date: "Jul 31", amWt: 275.0, pmWt: 279.8, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffees", lunch: "N/A", dinner: "1.5 burgers, 3 servings chips", postDinner: "", other: "", water: "3" },
  { day: 4, weekday: "Fri", date: "Aug 1", amWt: 277.4, pmWt: 278.2, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffee", lunch: "N/A", dinner: "4 slices cheese pizza (Little Caesars)", postDinner: "Beer & popcorn", other: "", water: "3" },
  { day: 5, weekday: "Sat", date: "Aug 2", amWt: 275.0, pmWt: 278.4, breakfast: "Dadfuel and 2 slices bacon", caffeine: "2 Mushroom Coffees", lunch: "", dinner: "Sausage pasta", postDinner: "", other: "", water: "" },
  { day: 6, weekday: "Sun", date: "Aug 3", amWt: 277.4, pmWt: 278.4, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffees", lunch: "", dinner: "Sausage pasta", postDinner: "N/A", other: "Beer & popcorn", water: "3" },
  { day: 7, weekday: "Mon", date: "Aug 4", amWt: 276.4, pmWt: 278.2, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffees", lunch: "N/A", dinner: "Sausage pasta", postDinner: "", other: "One Popcorn", water: "" },
  { day: 8, weekday: "Tue", date: "Aug 5", amWt: 276.4, pmWt: null, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffees", lunch: "N/A", dinner: "Cheeseburger and two servings chips", postDinner: "Popcorn and a few beers", other: "", water: "3" },
  { day: 9, weekday: "Wed", date: "Aug 6", amWt: 275.8, pmWt: 274.8, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffees", lunch: "N/A", dinner: "", postDinner: "", other: "", water: "" },
  { day: 10, weekday: "Thu", date: "Aug 7", amWt: 272.8, pmWt: null, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffees", lunch: "N/A", dinner: "", postDinner: "", other: "", water: "" },
  { day: 11, weekday: "Fri", date: "Aug 8", amWt: 271.8, pmWt: null, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffees", lunch: "N/A", dinner: "", postDinner: "", other: "", water: "" },
  { day: 12, weekday: "Sat", date: "Aug 9", amWt: 272.6, pmWt: 270.0, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffees", lunch: "", dinner: "Stan's Sandwich", postDinner: "", other: "", water: "" },
  { day: 13, weekday: "Sun", date: "Aug 10", amWt: 275.8, pmWt: null, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffees", lunch: "", dinner: "", postDinner: "", other: "", water: "" },
  { day: 14, weekday: "Mon", date: "Aug 11", amWt: 276.8, pmWt: null, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffees", lunch: "", dinner: "", postDinner: "", other: "", water: "" },
  { day: 15, weekday: "Tue", date: "Aug 12", amWt: 275.0, pmWt: null, breakfast: "Dadfuel", caffeine: "2 Mushroom Coffees", lunch: "", dinner: "", postDinner: "Too much beer", other: "", water: "" },
];

const fadedDays = [
  { day: 16, weekday: "Wed", date: "Aug 13" },
  { day: 17, weekday: "Thu", date: "Aug 14" },
  { day: 18, weekday: "Fri", date: "Aug 15" },
  { day: 19, weekday: "Sat", date: "Aug 16" },
  { day: 20, weekday: "Sun", date: "Aug 17" },
];

// ─── New Tracking Dates: Feb 15 – Mar 1 ───
const generateNewDates = () => {
  const dates = [];
  const start = new Date(2026, 1, 15);
  const end = new Date(2026, 2, 1);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar"];
  let d = new Date(start);
  let dayNum = 1;
  while (d <= end) {
    dates.push({
      dayNum,
      weekday: dayNames[d.getDay()],
      date: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    });
    d.setDate(d.getDate() + 1);
    dayNum++;
  }
  return dates;
};
const newDates = generateNewDates();

// ─── Scripture & Catholic Quotes ───
const scriptures = [
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13", type: "scripture" },
  { text: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own; you were bought at a price. Therefore honor God with your bodies.", ref: "1 Corinthians 6:19-20", type: "scripture" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", ref: "Isaiah 40:31", type: "scripture" },
  { text: "No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness and peace for those who have been trained by it.", ref: "Hebrews 12:11", type: "scripture" },
  { text: "Therefore I urge you, brothers and sisters, in view of God's mercy, to offer your bodies as a living sacrifice, holy and pleasing to God — this is your true and proper worship.", ref: "Romans 12:1", type: "scripture" },
  { text: "For God gave us a spirit not of fear but of power and love and self-control.", ref: "2 Timothy 1:7", type: "scripture" },
  { text: "Do not be afraid. Do not be satisfied with mediocrity. Put out into the deep and let down your nets for a catch.", ref: "St. John Paul II", type: "saint" },
  { text: "Start by doing what's necessary; then do what's possible; and suddenly you are doing the impossible.", ref: "St. Francis of Assisi", type: "saint" },
  { text: "Pray as though everything depended on God. Work as though everything depended on you.", ref: "St. Augustine", type: "saint" },
  { text: "Have patience with all things, but chiefly have patience with yourself.", ref: "St. Francis de Sales", type: "saint" },
  { text: "You must never be discouraged or give way to anxiety… place all your trust in God.", ref: "St. Padre Pio", type: "saint" },
];

// ─── Scripture Card Component ───
const ScriptureHero = ({ quote, onNext, onPrev }) => (
  <div style={{
    background: `linear-gradient(135deg, ${C.scarletDark} 0%, #5C0000 100%)`,
    borderRadius: 20,
    padding: "32px 24px 28px",
    margin: "0 0 20px",
    position: "relative",
    overflow: "hidden",
    color: C.white,
    textAlign: "center",
    minHeight: 180,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  }}>
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 200, opacity: 0.04, fontWeight: 900, lineHeight: 1, pointerEvents: "none", fontFamily: "serif" }}>✝</div>
    <div style={{ position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)", width: "120%", height: "60%", background: "radial-gradient(ellipse, rgba(200,169,81,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

    <div style={{ position: "relative", zIndex: 1, maxWidth: 520 }}>
      <div style={{ display: "inline-block", background: "rgba(200,169,81,0.25)", borderRadius: 20, padding: "4px 14px", marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: C.gold, fontFamily: "'Barlow', sans-serif" }}>
          {quote.type === "scripture" ? "Daily Scripture" : "Words of the Saints"}
        </span>
      </div>
      <p style={{
        margin: "0 0 16px",
        fontSize: 19,
        fontFamily: "'Playfair Display', Georgia, serif",
        fontStyle: "italic",
        lineHeight: 1.55,
        fontWeight: 500,
        letterSpacing: "0.2px",
        textShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }}>
        "{quote.text}"
      </p>
      <p style={{
        margin: 0,
        fontSize: 13,
        fontWeight: 700,
        color: C.gold,
        letterSpacing: "0.8px",
        fontFamily: "'Barlow', sans-serif",
        textTransform: "uppercase",
      }}>
        — {quote.ref}
      </p>
    </div>

    <div style={{ display: "flex", gap: 12, marginTop: 18, position: "relative", zIndex: 1 }}>
      <button onClick={onPrev} onTouchStart={(e) => e.currentTarget.style.transform = "scale(0.9)"} onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"} style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", color: C.white, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.1s" }}>‹</button>
      <button onClick={onNext} onTouchStart={(e) => e.currentTarget.style.transform = "scale(0.9)"} onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"} style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", color: C.white, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.1s" }}>›</button>
    </div>
  </div>
);

// ─── Stat Card ───
const StatCard = ({ label, value, unit, icon, sub }) => (
  <div style={{ background: C.white, borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: `1px solid ${C.offWhite}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 10, color: C.gray, fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 14 }}>{icon}</span>
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginTop: 2 }}>
      <span style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", color: C.grayDark }}>{value}</span>
      {unit && <span style={{ fontSize: 12, color: C.gray }}>{unit}</span>}
    </div>
    {sub && <span style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>{sub}</span>}
  </div>
);

// ─── Input Field ───
const Field = ({ label, placeholder, value, onChange, type, span2 }) => (
  <div style={{ gridColumn: span2 ? "1 / -1" : undefined }}>
    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: C.gray, letterSpacing: "0.6px", marginBottom: 4, display: "block" }}>{label}</label>
    <input
      type={type || "text"}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      style={{
        width: "100%", padding: "10px 12px", borderRadius: 10,
        border: `1.5px solid #e0e0e0`, fontFamily: "'Barlow', sans-serif", fontSize: 16,
        outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
        WebkitAppearance: "none", background: C.white,
      }}
      onFocus={(e) => e.target.style.borderColor = C.scarlet}
      onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
    />
  </div>
);

// ─── Empty state for initial entries ───
const makeEmptyEntry = () => ({
  amWt: "", pmWt: "", breakfast: "", caffeine: "", lunch: "",
  dinner: "", postDinner: "", other: "", water: "", exercise: "", notes: "",
});

// ═══════════ MAIN COMPONENT ═══════════
export default function App() {
  const [activeTab, setActiveTab] = useState("history");
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [expandedDay, setExpandedDay] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEntries, setNewEntries] = useState(() => {
    const init = {};
    newDates.forEach((d) => { init[d.dateKey] = makeEmptyEntry(); });
    return init;
  });

  // ─── Load entries from Supabase on mount ───
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const { data, error } = await supabase
          .from("diet_entries")
          .select("*");

        if (error) {
          console.error("Failed to load entries:", error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          setNewEntries((prev) => {
            const merged = { ...prev };
            data.forEach((row) => {
              if (merged[row.date_key]) {
                merged[row.date_key] = {
                  amWt: row.am_wt || "",
                  pmWt: row.pm_wt || "",
                  breakfast: row.breakfast || "",
                  caffeine: row.caffeine || "",
                  lunch: row.lunch || "",
                  dinner: row.dinner || "",
                  postDinner: row.post_dinner || "",
                  other: row.other || "",
                  water: row.water || "",
                  exercise: row.exercise || "",
                  notes: row.notes || "",
                };
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.error("Failed to load entries:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  // ─── Scripture rotation ───
  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % scriptures.length), 15000);
    return () => clearInterval(t);
  }, []);

  const nextQuote = useCallback(() => setQuoteIdx((i) => (i + 1) % scriptures.length), []);
  const prevQuote = useCallback(() => setQuoteIdx((i) => (i - 1 + scriptures.length) % scriptures.length), []);
  const toggleDay = useCallback((i) => setExpandedDay((current) => current === i ? null : i), []);

  // Stats (memoized — historicalData is static)
  const { validWeights, startWt, lowestWt, totalLoss, daysTracked, weightChartData } = useMemo(() => {
    const validWeights = historicalData.filter((d) => d.amWt).map((d) => d.amWt);
    const startWt = validWeights[0];
    const lowestWt = Math.min(...validWeights);
    const totalLoss = (startWt - lowestWt).toFixed(1);
    const daysTracked = validWeights.length;
    const weightChartData = historicalData.filter((d) => d.amWt).map((d) => ({
      name: d.date, am: d.amWt, pm: d.pmWt || null,
    }));
    return { validWeights, startWt, lowestWt, totalLoss, daysTracked, weightChartData };
  }, []);

  const newWeightData = useMemo(() =>
    newDates
      .filter((d) => newEntries[d.dateKey]?.amWt)
      .map((d) => ({
        name: d.date,
        am: parseFloat(newEntries[d.dateKey].amWt) || null,
        pm: parseFloat(newEntries[d.dateKey].pmWt) || null,
      })),
    [newEntries]
  );

  const handleInput = useCallback((dateKey, field, value) => {
    setNewEntries((prev) => {
      if (prev[dateKey]?.[field] === value) return prev;
      return { ...prev, [dateKey]: { ...prev[dateKey], [field]: value } };
    });
  }, []);

  // ─── Save to Supabase ───
  const handleSave = async () => {
    setSaving(true);
    setSavedMsg("");

    const rows = newDates
      .filter((d) => Object.values(newEntries[d.dateKey] || {}).some((v) => v !== ""))
      .map((d) => {
        const e = newEntries[d.dateKey];
        return {
          date_key: d.dateKey,
          am_wt: e.amWt || null,
          pm_wt: e.pmWt || null,
          breakfast: e.breakfast || null,
          caffeine: e.caffeine || null,
          lunch: e.lunch || null,
          dinner: e.dinner || null,
          post_dinner: e.postDinner || null,
          other: e.other || null,
          water: e.water || null,
          exercise: e.exercise || null,
          notes: e.notes || null,
          updated_at: new Date().toISOString(),
        };
      });

    if (rows.length === 0) {
      setSavedMsg("Nothing to save yet — start logging!");
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 2500);
      return;
    }

    const { error } = await supabase
      .from("diet_entries")
      .upsert(rows, { onConflict: "date_key" });

    if (error) {
      console.error("Save failed:", error);
      setSavedMsg("Save failed — check connection and try again.");
    } else {
      setSavedMsg("Progress saved!");
    }

    setSaving(false);
    setTimeout(() => setSavedMsg(""), 2500);
  };

  const quote = scriptures[quoteIdx];

  const tabStyle = (tab) => ({
    flex: 1,
    padding: "12px 8px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    background: activeTab === tab ? C.scarlet : C.white,
    color: activeTab === tab ? C.white : C.gray,
    transition: "background-color 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s",
    willChange: "background-color, box-shadow",
    letterSpacing: "0.3px",
    boxShadow: activeTab === tab ? "0 2px 8px rgba(187,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
    textAlign: "center",
    whiteSpace: "nowrap",
  });

  const card = {
    background: C.white, borderRadius: 16, padding: "20px 16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${C.offWhite}`,
  };

  const sectionTitle = {
    margin: "0 0 14px", fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 18, fontWeight: 700, color: C.grayDark, letterSpacing: "0.5px",
  };

  if (loading) {
    return (
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        background: `linear-gradient(180deg, ${C.warmCream} 0%, #EDEBE7 100%)`,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}>
  
        <div style={{ fontSize: 40 }}>🏈</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: C.grayDark }}>Loading tracker...</p>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Barlow', sans-serif",
      background: `linear-gradient(180deg, ${C.warmCream} 0%, #EDEBE7 100%)`,
      minHeight: "100vh",
      color: C.grayDark,
      maxWidth: "100vw",
      overflowX: "hidden",
    }}>


      {/* ═══ HEADER ═══ */}
      <div style={{
        background: `linear-gradient(135deg, ${C.scarlet} 0%, ${C.scarletDark} 100%)`,
        padding: "28px 20px 24px",
        color: C.white,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", border: "30px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.18)", padding: "4px 12px", borderRadius: 16, letterSpacing: "1px", textTransform: "uppercase" }}>Go Bucks!</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(200,169,81,0.3)", padding: "4px 12px", borderRadius: 16, letterSpacing: "0.5px", color: C.goldSoft }}>Round 2</span>
          </div>
          <h1 style={{ margin: "6px 0 2px", fontSize: 36, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, letterSpacing: "-0.3px", lineHeight: 1.1 }}>KYLE DOLAN</h1>
          <h2 style={{ margin: "0 0 6px", fontSize: 16, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, opacity: 0.9, letterSpacing: "1px", textTransform: "uppercase" }}>Diet &amp; Accountability Tracker</h2>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.7, lineHeight: 1.4 }}>
            10.4 lbs down in 11 days last summer. Time to finish what you started.
          </p>
        </div>
      </div>

      <div style={{ padding: "0 16px", maxWidth: 600, margin: "0 auto" }}>
        {/* ═══ SCRIPTURE HERO ═══ */}
        <div style={{ margin: "20px 0 0" }}>
          <ScriptureHero quote={quote} onNext={nextQuote} onPrev={prevQuote} />
        </div>

        {/* ═══ TABS ═══ */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button style={tabStyle("history")} onClick={() => setActiveTab("history")} onTouchStart={(e) => e.currentTarget.style.transform = "scale(0.95)"} onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"}> Last Attempt</button>
          <button style={tabStyle("track")} onClick={() => setActiveTab("track")} onTouchStart={(e) => e.currentTarget.style.transform = "scale(0.95)"} onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"}> Track</button>
          <button style={tabStyle("progress")} onClick={() => setActiveTab("progress")} onTouchStart={(e) => e.currentTarget.style.transform = "scale(0.95)"} onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"}> Progress</button>
        </div>

        {/* ═══ HISTORY TAB ═══ */}
        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <StatCard label="Start Weight" value={startWt} unit="lbs" icon="📅" sub="Jul 29" />
              <StatCard label="Lowest" value={lowestWt} unit="lbs" icon="🔥" sub={`↓ ${totalLoss} lbs`} />
              <StatCard label="Best Streak" value="11" unit="days" icon="⚡" sub="Jul 29 – Aug 8" />
              <StatCard label="Days Tracked" value={daysTracked} unit="/ 20" icon="📋" sub="Faded Aug 13" />
            </div>

            <div style={card}>
              <h3 style={sectionTitle}>WEIGHT TREND</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={weightChartData} margin={{ left: -10, right: 4 }}>
                  <defs>
                    <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.scarlet} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={C.scarlet} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.gray }} interval={1} angle={-35} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 10, fill: C.gray }} domain={[268, 284]} width={36} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontSize: 13 }} />
                  <Area type="monotone" dataKey="am" stroke={C.scarlet} strokeWidth={2.5} fill="url(#wtGrad)" name="AM Weight" dot={{ fill: C.scarlet, r: 3 }} connectNulls />
                  <Line type="monotone" dataKey="pm" stroke={C.gold} strokeWidth={1.5} strokeDasharray="4 3" name="PM Weight" dot={{ fill: C.gold, r: 2.5 }} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, marginTop: 6, justifyContent: "center" }}>
                <span style={{ fontSize: 11, color: C.gray, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 3, background: C.scarlet, borderRadius: 2, display: "inline-block" }} /> AM
                </span>
                <span style={{ fontSize: 11, color: C.gray, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 3, background: C.gold, borderRadius: 2, display: "inline-block" }} /> PM
                </span>
              </div>
            </div>

            <div style={{ ...card, borderLeft: `4px solid ${C.green}`, padding: "16px 16px" }}>
              <h3 style={{ ...sectionTitle, fontSize: 15, margin: "0 0 8px", color: C.greenDark }}>WHAT THE DATA SHOWS</h3>
              <div style={{ fontSize: 13, color: C.gray, lineHeight: 1.65 }}>
                <p style={{ margin: "0 0 6px" }}><strong style={{ color: C.grayDark }}>The formula worked:</strong> Dadfuel + skipping lunch + one dinner = 282.2 → 271.8 in 11 days.</p>
                <p style={{ margin: "0 0 6px" }}><strong style={{ color: C.grayDark }}>Beer nights</strong> caused next-day spikes but you still trended down overall.</p>
                <p style={{ margin: 0 }}><strong style={{ color: C.grayDark }}>Key insight:</strong> When logging stopped, so did progress. Accountability = results.</p>
              </div>
            </div>

            <div style={{ background: C.goldSoft, borderRadius: 14, padding: "14px 18px", textAlign: "center", border: `1px solid rgba(200,169,81,0.2)` }}>
              <p style={{ margin: "0 0 4px", fontSize: 14, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: C.grayDark, lineHeight: 1.5 }}>
                "For God gave us a spirit not of fear but of power and love and self-control."
              </p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.scarlet, letterSpacing: "0.5px" }}>— 2 Timothy 1:7</p>
            </div>

            <div style={card}>
              <h3 style={sectionTitle}>DAILY LOG</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {historicalData.map((d, i) => {
                  const hasDetail = d.dinner || d.postDinner || d.other;
                  const isExpanded = expandedDay === i;
                  return (
                    <div key={i} onClick={() => hasDetail && toggleDay(i)} style={{
                      padding: "10px 12px", borderRadius: 10, background: C.warmCream,
                      cursor: hasDetail ? "pointer" : "default",
                      border: isExpanded ? `2px solid ${C.scarlet}` : `1px solid transparent`,
                      transition: "border-color 0.15s",
                      contain: "layout",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                            background: d.amWt ? `linear-gradient(135deg, ${C.scarlet}, ${C.scarletDark})` : C.grayLight,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14,
                          }}>{d.day}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{d.weekday}, {d.date}</div>
                            <div style={{ fontSize: 10, color: C.gray, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.breakfast}{d.caffeine ? ` · ${d.caffeine}` : ""}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {d.amWt && (
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", color: C.grayDark }}>{d.amWt}</div>
                              <div style={{ fontSize: 9, color: C.gray }}>AM</div>
                            </div>
                          )}
                          {d.pmWt && (
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Barlow Condensed', sans-serif", color: C.gold }}>{d.pmWt}</div>
                              <div style={{ fontSize: 9, color: C.gray }}>PM</div>
                            </div>
                          )}
                          {hasDetail && <span style={{ fontSize: 12, color: C.grayLight, transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", willChange: "transform" }}>▾</span>}
                        </div>
                      </div>
                      {isExpanded && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid #e8e6e2`, fontSize: 12, color: C.gray, lineHeight: 1.7 }}>
                          {d.dinner && <div><strong style={{ color: C.grayDark }}>Dinner:</strong> {d.dinner}</div>}
                          {d.postDinner && d.postDinner !== "N/A" && <div><strong style={{ color: C.scarlet }}>Post-Dinner:</strong> {d.postDinner}</div>}
                          {d.other && <div><strong style={{ color: C.grayDark }}>Other:</strong> {d.other}</div>}
                          {d.water && <div><strong style={{ color: C.blue }}>Water:</strong> {d.water}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {fadedDays.map((d, i) => (
                  <div key={`f${i}`} style={{ padding: "10px 12px", borderRadius: 10, background: C.warmCream, opacity: 0.35 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: C.grayLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14 }}>{d.day}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: C.grayLight }}>{d.weekday}, {d.date}</div>
                        <div style={{ fontSize: 10, color: C.grayLight, fontStyle: "italic" }}>No data</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TRACK TAB ═══ */}
        {activeTab === "track" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ ...card, borderLeft: `4px solid ${C.scarlet}`, padding: "14px 16px" }}>
              <h3 style={{ ...sectionTitle, margin: "0 0 4px", fontSize: 16 }}>ROUND 2 — FEB 15 TO MAR 1</h3>
              <p style={{ margin: 0, fontSize: 12, color: C.gray, lineHeight: 1.45 }}>15 days. Same formula. Log everything — the good and the bad. Your friends are watching.</p>
            </div>

            {savedMsg && (
              <div style={{
                padding: "10px 14px",
                background: savedMsg.includes("failed") ? "#FFEBEE" : "#E8F5E9",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                color: savedMsg.includes("failed") ? C.scarlet : C.greenDark,
                textAlign: "center",
              }}>{savedMsg}</div>
            )}

            {newDates.map((d, idx) => {
              const entry = newEntries[d.dateKey] || {};
              const hasData = Object.values(entry).some((v) => v !== "");
              const scriptureInsert = idx > 0 && idx % 5 === 0;
              const insertQuote = scriptures[idx % scriptures.length];

              return (
                <div key={d.dateKey}>
                  {scriptureInsert && (
                    <div style={{ background: C.goldSoft, borderRadius: 14, padding: "14px 16px", textAlign: "center", marginBottom: 14, border: `1px solid rgba(200,169,81,0.2)` }}>
                      <p style={{ margin: "0 0 4px", fontSize: 14, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: C.grayDark, lineHeight: 1.5 }}>
                        "{insertQuote.text}"
                      </p>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: C.scarlet, letterSpacing: "0.5px" }}>— {insertQuote.ref}</p>
                    </div>
                  )}
                  <div style={{
                    ...card,
                    padding: "14px 14px 16px",
                    borderLeft: hasData ? `4px solid ${C.green}` : `4px solid ${C.grayLight}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: hasData ? `linear-gradient(135deg, ${C.green}, ${C.greenDark})` : `linear-gradient(135deg, ${C.scarlet}, ${C.scarletDark})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14,
                      }}>{d.dayNum}</div>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{d.weekday}, {d.date}</span>
                      {hasData && <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>✓</span>}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <Field label="AM Weight" placeholder="lbs" type="number" value={entry.amWt} onChange={(e) => handleInput(d.dateKey, "amWt", e.target.value)} />
                      <Field label="PM Weight" placeholder="lbs" type="number" value={entry.pmWt} onChange={(e) => handleInput(d.dateKey, "pmWt", e.target.value)} />
                      <Field label="Water" placeholder="e.g. 3 x 30oz" value={entry.water} onChange={(e) => handleInput(d.dateKey, "water", e.target.value)} />
                      <Field label="Caffeine" placeholder="e.g. 2 Mushroom Coffee" value={entry.caffeine} onChange={(e) => handleInput(d.dateKey, "caffeine", e.target.value)} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 10 }}>
                      <Field label="Breakfast" placeholder="e.g. Dadfuel" value={entry.breakfast} onChange={(e) => handleInput(d.dateKey, "breakfast", e.target.value)} />
                      <Field label="Lunch" placeholder="e.g. N/A" value={entry.lunch} onChange={(e) => handleInput(d.dateKey, "lunch", e.target.value)} />
                      <Field label="Dinner" placeholder="What'd you eat?" value={entry.dinner} onChange={(e) => handleInput(d.dateKey, "dinner", e.target.value)} />
                      <Field label="Post-Dinner / Snacks" placeholder="Be honest..." value={entry.postDinner} onChange={(e) => handleInput(d.dateKey, "postDinner", e.target.value)} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                      <Field label="Exercise" placeholder="e.g. 30 min walk" value={entry.exercise} onChange={(e) => handleInput(d.dateKey, "exercise", e.target.value)} />
                      <Field label="Other / Notes" placeholder="Beer? How you feel?" value={entry.notes} onChange={(e) => handleInput(d.dateKey, "notes", e.target.value)} />
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleSave}
              disabled={saving}
              onTouchStart={(e) => !saving && (e.currentTarget.style.transform = "scale(0.97)")}
              onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
              style={{
                width: "100%", padding: "16px", borderRadius: 14, border: "none",
                background: saving
                  ? C.gray
                  : `linear-gradient(135deg, ${C.scarlet}, ${C.scarletDark})`,
                color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: 18, letterSpacing: "1px", cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(187,0,0,0.3)",
                position: "sticky",
                bottom: "max(16px, env(safe-area-inset-bottom))",
                zIndex: 10,
                transition: "transform 0.1s",
              }}>
              {saving ? "SAVING..." : "SAVE PROGRESS"}
            </button>
          </div>
        )}

        {/* ═══ PROGRESS TAB ═══ */}
        {activeTab === "progress" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {newWeightData.length > 0 ? (
              <>
                <div style={{ background: C.goldSoft, borderRadius: 14, padding: "14px 18px", textAlign: "center", border: `1px solid rgba(200,169,81,0.2)` }}>
                  <p style={{ margin: "0 0 4px", fontSize: 14, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: C.grayDark, lineHeight: 1.5 }}>
                    "No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness and peace."
                  </p>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: C.scarlet, letterSpacing: "0.5px" }}>— Hebrews 12:11</p>
                </div>

                <div style={card}>
                  <h3 style={sectionTitle}>ROUND 2 WEIGHT TREND</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={newWeightData} margin={{ left: -10, right: 4 }}>
                      <defs>
                        <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.greenDark} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={C.greenDark} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.gray }} angle={-35} textAnchor="end" height={40} />
                      <YAxis tick={{ fontSize: 10, fill: C.gray }} width={36} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontSize: 13 }} />
                      <Area type="monotone" dataKey="am" stroke={C.greenDark} strokeWidth={2.5} fill="url(#nwGrad)" name="AM Weight" dot={{ fill: C.greenDark, r: 3 }} connectNulls />
                      {newWeightData.some((d) => d.pm) && <Line type="monotone" dataKey="pm" stroke={C.gold} strokeWidth={1.5} strokeDasharray="4 3" name="PM Weight" dot={{ fill: C.gold, r: 2.5 }} connectNulls />}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {(() => {
                    const amWts = newWeightData.filter((d) => d.am).map((d) => d.am);
                    if (!amWts.length) return null;
                    const first = amWts[0], last = amWts[amWts.length - 1], low = Math.min(...amWts);
                    const chg = (first - last).toFixed(1);
                    return [
                      { label: "Start", value: first, icon: "📅" },
                      { label: "Current", value: last, icon: "⚖️" },
                      { label: "Lowest", value: low, icon: "🔥" },
                      { label: "Change", value: `${chg > 0 ? "-" : "+"}${Math.abs(chg)}`, icon: chg > 0 ? "📉" : "📈" },
                    ].map((s) => <StatCard key={s.label} {...s} unit="lbs" />);
                  })()}
                </div>

                <div style={card}>
                  <h3 style={sectionTitle}>LOGGED ENTRIES</h3>
                  {newDates.filter((d) => Object.values(newEntries[d.dateKey] || {}).some((v) => v !== "")).map((d) => {
                    const e = newEntries[d.dateKey];
                    return (
                      <div key={d.dateKey} style={{ padding: "10px 0", borderBottom: `1px solid ${C.offWhite}` }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{d.weekday}, {d.date}</div>
                        <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.7 }}>
                          {e.amWt && <span style={{ marginRight: 12 }}>⚖️ <strong>{e.amWt}</strong>{e.pmWt ? ` / ${e.pmWt}` : ""} lbs</span>}
                          {e.water && <span style={{ marginRight: 12 }}>💧 {e.water}</span>}
                          {e.exercise && <span>🏃 {e.exercise}</span>}
                          {e.breakfast && <div>🍳 {e.breakfast}</div>}
                          {e.dinner && <div>🍽️ {e.dinner}</div>}
                          {e.postDinner && <div style={{ color: C.scarlet }}>🍿 {e.postDinner}</div>}
                          {e.notes && <div style={{ fontStyle: "italic" }}>📝 {e.notes}</div>}
                        </div>
                      </div>
                    );
                  })}
                  {newDates.filter((d) => Object.values(newEntries[d.dateKey] || {}).some((v) => v !== "")).length === 0 && (
                    <p style={{ textAlign: "center", color: C.grayLight, fontSize: 13, padding: "20px 0" }}>No entries yet. Start logging in the <strong>Track</strong> tab!</p>
                  )}
                </div>
              </>
            ) : (
              <div style={{ ...card, textAlign: "center", padding: "48px 16px" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📊</div>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: C.grayDark, margin: "0 0 6px" }}>NO DATA YET</h3>
                <p style={{ color: C.gray, fontSize: 13, margin: "0 0 6px" }}>Start logging and your charts appear here.</p>
                <p style={{ fontSize: 14, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: C.grayDark, margin: "12px 0 4px" }}>
                  "But those who hope in the Lord will renew their strength."
                </p>
                <p style={{ margin: "0 0 16px", fontSize: 10, fontWeight: 700, color: C.scarlet }}>— Isaiah 40:31</p>
                <button onClick={() => setActiveTab("track")} onTouchStart={(e) => e.currentTarget.style.transform = "scale(0.95)"} onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"} style={{
                  padding: "12px 28px", borderRadius: 10, border: "none",
                  background: C.scarlet, color: C.white, fontWeight: 700,
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15,
                  cursor: "pointer", transition: "transform 0.1s",
                }}>START LOGGING →</button>
              </div>
            )}
          </div>
        )}

        {/* ═══ FOOTER ═══ */}
        <div style={{ ...card, marginTop: 28, marginBottom: 32, textAlign: "center", padding: "20px 16px" }}>
          <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: C.grayDark }}>You've done this before. You can do it again.</p>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: C.gray, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", lineHeight: 1.55 }}>
            "Therefore, I urge you, brothers and sisters, in view of God's mercy, to offer your bodies as a living sacrifice, holy and pleasing to God — this is your true and proper worship."
          </p>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: C.scarlet }}>— Romans 12:1</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: C.grayLight }}>Made with ❤️ by friends who care</span>
            <span style={{ fontSize: 10, color: C.grayLight }}>·</span>
            <span style={{ fontSize: 10, color: C.scarlet, fontWeight: 700 }}>O-H-I-O!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
