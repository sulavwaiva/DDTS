import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const API = "http://localhost:3000/api";

const C = {
  teal: "#0F3D3B",
  tealDeep: "#082221",
  tealMid: "#144B47",
  gold: "#E8992B",
  blue: "#1F5C9E",
  red: "#D5402F",
  cream: "#FAF8F3",
  green: "#2E7D52",
  purple: "#6B3FA0",
};

const CATEGORY_STYLES = {
  school:     { label: "Schools",    emoji: "🏫", color: C.blue,   bg: "#EAF1F8" },
  healthcare: { label: "Healthcare", emoji: "🏥", color: C.green,  bg: "#E9F1EF" },
  bank:       { label: "Banks",      emoji: "🏦", color: C.gold,   bg: "#FDF3E5" },
  shelter:    { label: "Shelters",   emoji: "🏠", color: C.purple, bg: "#F3EEF9" },
};

const OWNERSHIP_COLORS = {
  "Public":            C.green,
  "Private":           C.blue,
  "Government":        C.gold,
  "NGO":               C.purple,
  "Private Nonprofit": C.red,
  "Non-profit":        C.red,
  "Joint Venture":     "#0891B2",
  "Cooperative":       "#059669",
  "Private/NGO":       "#9333EA",
};

function ChartCanvas({ id, type, data, options, height = 240 }) {
  const ref  = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (!ref.current || !data) return;
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current, { type, data, options });
    return () => { if (inst.current) inst.current.destroy(); };
  }, [JSON.stringify(data)]);
  return <canvas ref={ref} style={{ maxHeight: height }} />;
}

function Section({ title, children }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E7E2D6",
      borderRadius: 14, padding: "20px 24px", marginBottom: 16,
    }}>
      <p style={{
        margin: "0 0 14px", fontSize: 10.5, fontWeight: 700,
        color: "#9AA6A3", textTransform: "uppercase", letterSpacing: "1px",
        borderBottom: "1px solid #F0EBE0", paddingBottom: 10,
      }}>{title}</p>
      {children}
    </div>
  );
}

function FacilityRow({ f }) {
  const s = CATEGORY_STYLES[f.category];
  return (
    <div style={{
      display: "flex", gap: 14, alignItems: "flex-start",
      padding: "13px 0", borderBottom: "1px solid #F5F0E8",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: s?.bg, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}>
        {s?.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 3px", fontSize: 13.5, fontWeight: 700, color: C.tealDeep }}>{f.name}</p>
        <p style={{ margin: "0 0 2px", fontSize: 11.5, color: "#7C8C89" }}>
          {f.type} · {f.ownership}
          {f.ward ? ` · ${f.ward}` : ""}
        </p>
        {f.phone   && <p style={{ margin: "1px 0 0", fontSize: 11, color: C.green }}>📞 {f.phone}</p>}
        {f.address && <p style={{ margin: "1px 0 0", fontSize: 11, color: "#9AA6A3" }}>📍 {f.address}</p>}
        {f.details && <p style={{ margin: "5px 0 0", fontSize: 11.5, color: "#9AA6A3", lineHeight: 1.5 }}>{f.details}</p>}
      </div>
    </div>
  );
}

export default function FacilitiesPage() {
  const [all, setAll]           = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [category, setCategory] = useState("all");
  const [search, setSearch]     = useState("");

  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");

 // Load districts
useEffect(() => {
  fetch(`${API}/districts`)
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        setDistricts(d.data);
      } else {
        setError(d.message);
      }
    })
    .catch(() => setError("Could not reach the server."));
}, []);

// Load facilities for selected district
useEffect(() => {
  if (!selectedDistrict) {
    setAll([]);
    return;
  }

  setLoading(true);
  setError("");

  fetch(
    `${API}/facilities/district/${encodeURIComponent(selectedDistrict)}`
  )
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        setAll(d.data);
      } else {
        setError(d.message);
      }
    })
    .catch(() => setError("Could not reach the server."))
    .finally(() => setLoading(false));
}, [selectedDistrict]);


  const counts = {
    school:     all.filter(f => f.category === "school").length,
    healthcare: all.filter(f => f.category === "healthcare").length,
    bank:       all.filter(f => f.category === "bank").length,
    shelter:    all.filter(f => f.category === "shelter").length,
  };

  const filtered = all.filter(f => {
    const matchCat    = category === "all" || f.category === category;
    const matchSearch = !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.address   || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.type      || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.ownership || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Charts ─────────────────────────────────────────────────

  const categoryChart = {
    labels: ["Schools", "Healthcare", "Banks", "Shelters"],
    datasets: [{
      data: [counts.school, counts.healthcare, counts.bank, counts.shelter],
      backgroundColor: [C.blue, C.green, C.gold, C.purple],
      borderWidth: 2, borderColor: "#fff",
    }],
  };

  const govPrivateChart = {
    labels: ["Public / Govt / NGO", "Private"],
    datasets: [{
      data: [
        all.filter(f => ["Government","Public","NGO","Non-profit","Private Nonprofit"].includes(f.ownership)).length,
        all.filter(f => ["Private","Joint Venture","Cooperative","Private/NGO"].includes(f.ownership)).length,
      ],
      backgroundColor: [C.tealDeep, C.gold],
      borderWidth: 2, borderColor: "#fff",
    }],
  };

  const ownershipMap = {};
  filtered.forEach(f => { ownershipMap[f.ownership] = (ownershipMap[f.ownership] || 0) + 1; });
  const ownershipLabels = Object.keys(ownershipMap).sort((a, b) => ownershipMap[b] - ownershipMap[a]);
  const ownershipChart = {
    labels: ownershipLabels,
    datasets: [{
      label: "Count",
      data: ownershipLabels.map(l => ownershipMap[l]),
      backgroundColor: ownershipLabels.map(l => OWNERSHIP_COLORS[l] || C.tealMid),
      borderRadius: 6, borderSkipped: false,
    }],
  };

  const schoolTypeMap = {};
  all.filter(f => f.category === "school").forEach(f => {
    schoolTypeMap[f.type] = (schoolTypeMap[f.type] || 0) + 1;
  });
  const schoolTypeLabels = Object.keys(schoolTypeMap);
  const schoolTypeChart = {
    labels: schoolTypeLabels,
    datasets: [{
      label: "Schools",
      data: schoolTypeLabels.map(l => schoolTypeMap[l]),
      backgroundColor: [C.blue, "#3B82F6", "#93C5FD"],
      borderRadius: 6, borderSkipped: false,
    }],
  };

  const hcTypeMap = {};
  all.filter(f => f.category === "healthcare").forEach(f => {
    hcTypeMap[f.type] = (hcTypeMap[f.type] || 0) + 1;
  });
  const hcTypeLabels = Object.keys(hcTypeMap).sort((a, b) => hcTypeMap[b] - hcTypeMap[a]);
  const hcTypeChart = {
    labels: hcTypeLabels,
    datasets: [{
      label: "Facilities",
      data: hcTypeLabels.map(l => hcTypeMap[l]),
      backgroundColor: ["#0F3D3B","#144B47","#1F6B5C","#2E7D52","#4A9068","#6BAA84","#9DCDB3"],
      borderRadius: 6, borderSkipped: false,
    }],
  };

  const barOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.y}` } } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#F0EBE0" }, ticks: { color: "#9AA6A3", stepSize: 1 } },
      x: { grid: { display: false }, ticks: { color: C.tealMid, font: { size: 11 } } },
    },
  };

  const hBarOpts = {
    indexAxis: "y", responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.x}` } } },
    scales: {
      x: { beginAtZero: true, grid: { color: "#F0EBE0" }, ticks: { color: "#9AA6A3", stepSize: 1 } },
      y: { grid: { display: false }, ticks: { color: C.tealMid, font: { size: 11 } } },
    },
  };

  const doughnutOpts = {
    responsive: true,
    plugins: {
      legend: { position: "right", labels: { color: C.tealMid, padding: 12, font: { size: 12 } } },
      tooltip: { callbacks: { label: c => ` ${c.label}: ${c.parsed}` } },
    },
  };

  const statCards = [
    { key: "all",       label: "All",        value: all.length,       color: C.tealDeep, bg: C.cream,                  emoji: "📊" },
    { key: "school",    label: "Schools",     value: counts.school,    color: C.blue,     bg: "#EAF1F8",                emoji: "🏫" },
    { key: "healthcare",label: "Healthcare",  value: counts.healthcare, color: C.green,   bg: "#E9F1EF",                emoji: "🏥" },
    { key: "bank",      label: "Banks",       value: counts.bank,      color: C.gold,     bg: "#FDF3E5",                emoji: "🏦" },
    { key: "shelter",   label: "Shelters",    value: counts.shelter,   color: C.purple,   bg: "#F3EEF9",                emoji: "🏠" },
  ];

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* District Selection */}
<div
  style={{
    background: "#fff",
    border: "1px solid #DCE3DF",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 24,
  }}
>
  <label
    style={{
      display: "block",
      fontSize: 11,
      color: "#7C8C89",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: ".6px",
      fontWeight: 700,
    }}
  >
    Select District
  </label>

  <select
    value={selectedDistrict}
    onChange={e => {
      setSelectedDistrict(e.target.value);
      setCategory("all");
      setSearch("");
    }}
    style={{
      width: "100%",
      padding: "10px 14px",
      border: "1px solid #DCE3DF",
      borderRadius: 10,
      fontSize: 13,
      color: C.tealDeep,
      background: "#fff",
      outline: "none",
      cursor: "pointer",
    }}
  >
    <option value="">Select a district</option>

    {districts.map(d => (
      <option
        key={d.district_id}
        value={d.district_name}
      >
        {d.district_name}
      </option>
    ))}
  </select>
</div>


        {/* Header banner */}
        <div style={{
          background: C.tealDeep, borderRadius: 18,
          padding: "26px 28px", marginBottom: 24,
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: C.gold }}>
              {selectedDistrict} District
            </p>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff" }}>
              Facilities Directory
            </h1>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 20px", textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.gold }}>{all.length}</p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: ".6px" }}>
              Total Facilities
            </p>
          </div>
        </div>

        {loading && <div style={{ textAlign: "center", padding: 60, color: C.tealMid }}>Loading facilities…</div>}
        {error   && <div style={{ background: "#FBEAE8", border: `1px solid ${C.red}33`, borderRadius: 10, padding: 16, color: C.red }}>{error}</div>}

        {selectedDistrict && !loading && !error && (
          <>
            {/* Category stat cards */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              {statCards.map(s => (
                <div
                  key={s.key}
                  onClick={() => setCategory(s.key)}
                  style={{
                    background: category === s.key ? s.color : s.bg,
                    color: category === s.key ? "#fff" : s.color,
                    borderRadius: 12, padding: "12px 16px",
                    cursor: "pointer", flex: 1, minWidth: 90,
                    border: `2px solid ${s.color}`,
                    textAlign: "center", transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.emoji}</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Section title="Facilities by Category">
                <ChartCanvas id="cat" type="doughnut" data={categoryChart} options={doughnutOpts} height={220} />
              </Section>
              <Section title="Public vs Private">
                <ChartCanvas id="gov" type="doughnut" data={govPrivateChart} options={doughnutOpts} height={220} />
              </Section>
            </div>

            {/* Charts row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Section title="Schools by Type">
                <ChartCanvas id="school-type" type="bar" data={schoolTypeChart} options={barOpts} height={200} />
              </Section>
              <Section title="Healthcare by Type">
                <ChartCanvas id="hc-type" type="bar" data={hcTypeChart} options={{ ...hBarOpts, indexAxis: "y" }} height={200} />
              </Section>
            </div>

            {/* Ownership breakdown */}
            <Section title={`Ownership Breakdown — ${category === "all" ? "All Facilities" : CATEGORY_STYLES[category]?.label}`}>
              <ChartCanvas id="ownership" type="bar" data={ownershipChart} options={barOpts} height={200} />
            </Section>

            {/* Search */}
            <div style={{ marginBottom: 14 }}>
              <input
                type="text"
                placeholder={`Search ${category === "all" ? "all facilities" : CATEGORY_STYLES[category]?.label}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", boxSizing: "border-box",
                  border: "1px solid #DCE3DF", borderRadius: 10,
                  fontSize: 13, color: C.tealDeep, background: "#fff", outline: "none",
                }}
              />
            </div>

            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#8B9895" }}>
              Showing {filtered.length} {category === "all" ? "facilities" : CATEGORY_STYLES[category]?.label.toLowerCase()}
              {search && ` matching "${search}"`}
            </p>

            {/* Facility list */}
            <div style={{ background: "#fff", border: "1px solid #E7E2D6", borderRadius: 14, padding: "8px 24px" }}>
              <p style={{ margin: "14px 0 10px", fontSize: 10.5, fontWeight: 700, color: "#9AA6A3", textTransform: "uppercase", letterSpacing: "1px" }}>
                Facility List
              </p>
              {filtered.length === 0
                ? <p style={{ color: "#9AA6A3", textAlign: "center", padding: "30px 0" }}>No facilities found.</p>
                : filtered.map(f => <FacilityRow key={f.facility_id} f={f} />)
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}