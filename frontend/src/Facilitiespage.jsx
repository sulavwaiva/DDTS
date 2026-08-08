import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const API = "http://localhost:3000/api";

const CATEGORY_STYLES = {
  school:     { label: "Schools",     emoji: "🏫", color: "#1D4ED8", bg: "#EFF6FF" },
  healthcare: { label: "Healthcare",  emoji: "🏥", color: "#15803D", bg: "#F0FDF4" },
  bank:       { label: "Banks",       emoji: "🏦", color: "#B45309", bg: "#FFFBEB" },
  shelter:    { label: "Shelters",    emoji: "🏠", color: "#7C3AED", bg: "#F5F3FF" },
};

const OWNERSHIP_COLORS = {
  "Public":           "#2e7d52",
  "Private":          "#1D4ED8",
  "Government":       "#B45309",
  "NGO":              "#7C3AED",
  "Private Nonprofit":"#C2410C",
  "Non-profit":       "#C2410C",
  "Joint Venture":    "#0891B2",
  "Cooperative":      "#059669",
  "Private/NGO":      "#9333EA",
};

function ChartCanvas({ id, type, data, options, height = 240 }) {
  const ref = useRef(null);
  const inst = useRef(null);
  useEffect(() => {
    if (!ref.current || !data) return;
    if (inst.current) inst.current.destroy();
    inst.current = new Chart(ref.current, { type, data, options });
    return () => { if (inst.current) inst.current.destroy(); };
  }, [JSON.stringify(data)]);
  return <canvas ref={ref} style={{ maxHeight: height }} />;
}

function StatCard({ emoji, label, value, color, bg, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? color : bg,
        color: active ? "#fff" : color,
        borderRadius: 10, padding: "14px 18px",
        cursor: "pointer", flex: 1, minWidth: 120,
        border: `2px solid ${color}`,
        transition: "all 0.15s", textAlign: "center",
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", opacity: .8 }}>{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e0e9e4",
      borderRadius: 12, padding: "20px 24px", marginBottom: 20,
    }}>
      <h3 style={{
        margin: "0 0 16px", fontSize: 13, fontWeight: 700,
        color: "#1a3c2e", textTransform: "uppercase", letterSpacing: ".6px",
        borderBottom: "2px solid #e8f5ee", paddingBottom: 10,
      }}>{title}</h3>
      {children}
    </div>
  );
}

function FacilityRow({ f }) {
  const s = CATEGORY_STYLES[f.category];
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "12px 0", borderBottom: "1px solid #f0f4f2",
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{s?.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "#1a3c2e" }}>{f.name}</p>
        <p style={{ margin: "0 0 2px", fontSize: 11, color: "#7a9e8a" }}>
          {f.type} · {f.ownership} · {f.ward}
        </p>
        {f.phone && <p style={{ margin: 0, fontSize: 11, color: "#2e7d52" }}>📞 {f.phone}</p>}
        {f.address && <p style={{ margin: 0, fontSize: 11, color: "#9aada4" }}>📍 {f.address}</p>}
        {f.details && (
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9aada4", lineHeight: 1.5 }}>{f.details}</p>
        )}
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

  useEffect(() => {
    fetch(`${API}/districts/Bhaktapur/facilities`)
      .then(r => r.json())
      .then(d => { if (d.success) setAll(d.data); else setError(d.message); })
      .catch(() => setError("Could not reach the server."))
      .finally(() => setLoading(false));
  }, []);

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
      (f.address || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.type || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.ownership || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Chart data ──────────────────────────────────────────────

  // 1. Category breakdown — doughnut
  const categoryChartData = {
    labels: ["Schools", "Healthcare", "Banks", "Shelters"],
    datasets: [{
      data: [counts.school, counts.healthcare, counts.bank, counts.shelter],
      backgroundColor: ["#1D4ED8", "#15803D", "#B45309", "#7C3AED"],
      borderWidth: 2, borderColor: "#fff",
    }],
  };

  // 2. Ownership breakdown for current category — bar
  const ownershipMap = {};
  filtered.forEach(f => {
    ownershipMap[f.ownership] = (ownershipMap[f.ownership] || 0) + 1;
  });
  const ownershipLabels = Object.keys(ownershipMap).sort((a, b) => ownershipMap[b] - ownershipMap[a]);
  const ownershipChartData = {
    labels: ownershipLabels,
    datasets: [{
      label: "Count",
      data: ownershipLabels.map(l => ownershipMap[l]),
      backgroundColor: ownershipLabels.map(l => OWNERSHIP_COLORS[l] || "#2e7d52"),
      borderRadius: 6, borderSkipped: false,
    }],
  };

  // 3. Schools by type — bar (only when showing schools)
  const schoolTypeMap = {};
  all.filter(f => f.category === "school").forEach(f => {
    schoolTypeMap[f.type] = (schoolTypeMap[f.type] || 0) + 1;
  });
  const schoolTypeLabels = Object.keys(schoolTypeMap);
  const schoolTypeData = {
    labels: schoolTypeLabels,
    datasets: [{
      label: "Schools",
      data: schoolTypeLabels.map(l => schoolTypeMap[l]),
      backgroundColor: ["#1D4ED8", "#3B82F6", "#93C5FD"],
      borderRadius: 6, borderSkipped: false,
    }],
  };

  // 4. Healthcare by type — horizontal bar
  const hcTypeMap = {};
  all.filter(f => f.category === "healthcare").forEach(f => {
    hcTypeMap[f.type] = (hcTypeMap[f.type] || 0) + 1;
  });
  const hcTypeLabels = Object.keys(hcTypeMap).sort((a, b) => hcTypeMap[b] - hcTypeMap[a]);
  const hcTypeData = {
    labels: hcTypeLabels,
    datasets: [{
      label: "Facilities",
      data: hcTypeLabels.map(l => hcTypeMap[l]),
      backgroundColor: ["#15803D","#16A34A","#22C55E","#4ADE80","#86EFAC","#BBF7D0","#DCFCE7"],
      borderRadius: 6, borderSkipped: false,
    }],
  };

  // 5. Public vs private ownership — pie
  const govCount     = all.filter(f => ["Government","Public","NGO","Non-profit","Private Nonprofit"].includes(f.ownership)).length;
  const privateCount = all.filter(f => ["Private","Joint Venture","Cooperative","Private/NGO"].includes(f.ownership)).length;
  const govPrivateData = {
    labels: ["Public / Government / NGO", "Private"],
    datasets: [{
      data: [govCount, privateCount],
      backgroundColor: ["#2e7d52", "#1D4ED8"],
      borderWidth: 2, borderColor: "#fff",
    }],
  };

  const barOpts = (suffix = "") => ({
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.y}${suffix}` } } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f0f4f2" }, ticks: { color: "#7a9e8a", stepSize: 1 } },
      x: { grid: { display: false }, ticks: { color: "#2e4a38", font: { size: 11 } } },
    },
  });

  const hBarOpts = {
    indexAxis: "y",
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.x}` } } },
    scales: {
      x: { beginAtZero: true, grid: { color: "#f0f4f2" }, ticks: { color: "#7a9e8a", stepSize: 1 } },
      y: { grid: { display: false }, ticks: { color: "#2e4a38", font: { size: 11 } } },
    },
  };

  const doughnutOpts = {
    responsive: true,
    plugins: {
      legend: { position: "right", labels: { color: "#2e4a38", padding: 12, font: { size: 12 } } },
      tooltip: { callbacks: { label: c => ` ${c.label}: ${c.parsed}` } },
    },
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#1a3c2e" }}>
          Facilities — Bhaktapur
        </h1>
        <p style={{ margin: 0, color: "#7a9e8a", fontSize: 13 }}>
          Schools, Healthcare, Banks & Shelters · {all.length} facilities total
        </p>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 60, color: "#7a9e8a" }}>Loading...</div>}
      {error   && <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: 16, color: "#b91c1c" }}>{error}</div>}

      {!loading && !error && (
        <>
          {/* Category stat cards */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <div
              onClick={() => setCategory("all")}
              style={{
                background: category === "all" ? "#1a3c2e" : "#f0f4f2",
                color: category === "all" ? "#fff" : "#1a3c2e",
                borderRadius: 10, padding: "14px 18px",
                cursor: "pointer", flex: 1, minWidth: 100,
                border: "2px solid #1a3c2e", textAlign: "center",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>📊</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{all.length}</div>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", opacity: .8 }}>All</div>
            </div>
            {Object.entries(CATEGORY_STYLES).map(([key, s]) => (
              <StatCard
                key={key}
                emoji={s.emoji} label={s.label}
                value={counts[key]} color={s.color} bg={s.bg}
                active={category === key}
                onClick={() => setCategory(category === key ? "all" : key)}
              />
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <Section title="Facilities by Category">
              <ChartCanvas id="cat-chart" type="doughnut" data={categoryChartData} options={doughnutOpts} height={220} />
            </Section>
            <Section title="Public vs Private Ownership">
              <ChartCanvas id="gov-chart" type="doughnut" data={govPrivateData} options={doughnutOpts} height={220} />
            </Section>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <Section title="Schools by Type">
              <ChartCanvas id="school-type" type="bar" data={schoolTypeData} options={barOpts()} height={200} />
            </Section>
            <Section title="Healthcare Facilities by Type">
              <ChartCanvas id="hc-type" type="bar" data={hcTypeData} options={{ ...hBarOpts, indexAxis: "y" }} height={200} />
            </Section>
          </div>

          <div style={{ marginBottom: 20 }}>
            <Section title={`Ownership Breakdown — ${category === "all" ? "All Facilities" : CATEGORY_STYLES[category]?.label}`}>
              <ChartCanvas id="ownership-chart" type="bar" data={ownershipChartData} options={barOpts()} height={200} />
            </Section>
          </div>

          {/* Search */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder={`Search ${category === "all" ? "all facilities" : CATEGORY_STYLES[category]?.label}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", boxSizing: "border-box",
                border: "1px solid #d0e4d8", borderRadius: 8,
                fontSize: 13, color: "#1a3c2e", background: "#fafdfc",
              }}
            />
          </div>

          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#9aada4" }}>
            Showing {filtered.length} {category === "all" ? "facilities" : CATEGORY_STYLES[category]?.label.toLowerCase()}
            {search && ` matching "${search}"`}
          </p>

          {/* Facility list */}
          <Section title="Facility List">
            {filtered.length === 0 ? (
              <p style={{ color: "#9aada4", textAlign: "center", padding: 40 }}>No facilities found.</p>
            ) : (
              filtered.map(f => <FacilityRow key={f.facility_id} f={f} />)
            )}
          </Section>
        </>
      )}
    </div>
  );
}