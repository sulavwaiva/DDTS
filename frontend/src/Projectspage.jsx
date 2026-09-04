import { useState, useEffect } from "react";

const API = "http://localhost:3000/api";

const C = {
  teal: "#0F3D3B",
  tealDeep: "#082221",
  tealMid: "#144B47",
  gold: "#E8992B",
  blue: "#1F5C9E",
  red: "#D5402F",
  cream: "#FAF8F3",
};

const STATUS_STYLES = {
  planned:   { color: C.blue, bg: "#EAF1F8", label: "Planned" },
  ongoing:   { color: C.gold, bg: "#FDF3E5", label: "Ongoing" },
  completed: { color: C.teal, bg: "#E9F1EF", label: "Completed" },
  delayed:   { color: C.red,  bg: "#FBEAE8", label: "Delayed" },
};

function formatBudget(val) {
  if (!val) return "—";
  const n = parseFloat(val);
  if (n >= 10000000) return `Rs. ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `Rs. ${(n / 100000).toFixed(2)} Lakh`;
  return `Rs. ${n.toLocaleString()}`;
}

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.planned;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 11px", borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: ".6px",
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

function ProjectCard({ project, onClick }) {
  const s = STATUS_STYLES[project.status] || STATUS_STYLES.planned;
  return (
    <div
      onClick={() => onClick(project)}
      style={{
        background: "#fff",
        border: "1px solid #E7E2D6",
        borderLeft: `4px solid ${s.color}`,
        borderRadius: "0 12px 12px 0",
        padding: "16px 20px",
        cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.1s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(8,34,33,0.08)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.tealDeep, lineHeight: 1.4, flex: 1 }}>
          {project.name}
        </p>
        <Badge status={project.status} />
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>{formatBudget(project.budget)}</span>
        {project.fiscal_year    && <span style={{ fontSize: 12, color: "#7C8C89" }}>FY {project.fiscal_year}</span>}
        {project.funding_source && <span style={{ fontSize: 12, color: "#7C8C89" }}>{project.funding_source}</span>}
      </div>

      {project.remarks && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9AA6A3", lineHeight: 1.5 }}>
          {project.remarks.length > 100 ? project.remarks.slice(0, 100) + "…" : project.remarks}
        </p>
      )}
    </div>
  );
}

function ProjectModal({ project, onClose }) {
  if (!project) return null;
  const s = STATUS_STYLES[project.status] || STATUS_STYLES.planned;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(8,34,33,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16,
          padding: "28px 32px", maxWidth: 640, width: "100%",
          maxHeight: "80vh", overflowY: "auto",
          boxShadow: "0 24px 70px rgba(8,34,33,0.28)",
          borderTop: `4px solid ${s.color}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: C.tealDeep, lineHeight: 1.4, flex: 1, paddingRight: 12 }}>
            {project.name}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9AA6A3", padding: 0, lineHeight: 1 }}
          >×</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <Badge status={project.status} />
          {project.district_name && (
            <span style={{
              background: C.cream, color: C.tealMid,
              padding: "3px 11px", borderRadius: 20,
              fontSize: 11, fontWeight: 600,
              border: "1px solid #E7E2D6",
            }}>
              {project.district_name}
            </span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            ["Budget",          formatBudget(project.budget)],
            ["Funding Source",  project.funding_source || "—"],
            ["Fiscal Year",     project.fiscal_year || "—"],
            ["Start Date",      project.start_date      ? new Date(project.start_date).toLocaleDateString()      : "—"],
            ["Completion Date", project.completion_date  ? new Date(project.completion_date).toLocaleDateString() : "—"],
            ["District",        project.district_name || "—"],
          ].map(([label, value]) => (
            <div key={label} style={{ background: C.cream, borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ margin: "0 0 3px", fontSize: 10.5, color: "#9AA6A3", textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 700 }}>
                {label}
              </p>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.tealDeep }}>{value}</p>
            </div>
          ))}
        </div>

        {project.details && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: "0 0 6px", fontSize: 10.5, color: "#9AA6A3", textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 700 }}>Details</p>
            <p style={{ margin: 0, fontSize: 13.5, color: C.tealMid, lineHeight: 1.7 }}>{project.details}</p>
          </div>
        )}

        {project.remarks && (
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 10.5, color: "#9AA6A3", textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 700 }}>Remarks</p>
            <p style={{ margin: 0, fontSize: 13.5, color: C.tealMid, lineHeight: 1.7 }}>{project.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage({ token }) {
  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected]       = useState(null);

  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");

      useEffect(() => {
        async function loadDistricts() {
          try {
            const res = await fetch(`${API}/districts`);
            const data = await res.json();

            if (data.success) {
              setDistricts(data.data);
            }
          } catch (error) {
            console.error("Failed to load districts:", error);
          }
        }

  loadDistricts();
}, []);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`${API}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setProjects(data.data);
        else setError(data.message || "Failed to load projects");
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = projects.filter(p => {
  const matchDistrict =
    !selectedDistrict || p.district_name === selectedDistrict;

  const matchSearch =
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.remarks || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.funding_source || "").toLowerCase().includes(search.toLowerCase());

  const matchStatus =
    filterStatus === "all" || p.status === filterStatus;

  return matchDistrict && matchSearch && matchStatus;
});
  const districtProjects = selectedDistrict
  ? projects.filter(p => p.district_name === selectedDistrict)
  : [];

const stats = {
  total: districtProjects.length,
  planned: districtProjects.filter(p => p.status === "planned").length,
  ongoing: districtProjects.filter(p => p.status === "ongoing").length,
  completed: districtProjects.filter(p => p.status === "completed").length,
  budget: districtProjects.reduce(
    (sum, p) => sum + Number(p.budget || 0),
    0
  ),
};

  const statCards = [
    { key: "all",       label: "Total",     value: stats.total,     color: C.tealDeep, bg: C.cream },
    { key: "planned",   label: "Planned",   value: stats.planned,   color: C.blue,     bg: STATUS_STYLES.planned.bg },
    { key: "ongoing",   label: "Ongoing",   value: stats.ongoing,   color: C.gold,     bg: STATUS_STYLES.ongoing.bg },
    { key: "completed", label: "Completed", value: stats.completed, color: C.teal,     bg: STATUS_STYLES.completed.bg },
    { key: "delayed",   label: "Delayed",   value: stats.delayed,   color: C.red,      bg: STATUS_STYLES.delayed.bg },
  ];

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "32px 24px 60px" }}>
      

      {/* District selection */}
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
      setFilterStatus("all");
      setSearch("");
      setSelected(null);
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
      <option key={d.district_id} value={d.district_name}>
        {d.district_name}
      </option>
    ))}
  </select>
</div>
{!selectedDistrict && (
  <div
    style={{
      textAlign: "center",
      padding: "80px 0",
      color: "#9AA6A3",
      fontSize: 15,
    }}
  >
    Select a district to view projects
  </div>
)}

{selectedDistrict && (
  <>
        {/* Header banner */}
        <div style={{
          background: C.tealDeep, borderRadius: 18,
          padding: "26px 28px", marginBottom: 24,
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: C.gold }}>
              {selectedDistrict} Municipality
            </p>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff" }}>
              Development Projects
            </h1>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 20px", textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.gold }}>{formatBudget(stats.budget)}</p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: ".6px" }}>
              Total Allocated Budget
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          {statCards.map(s => (
            <div
              key={s.key}
              onClick={() => setFilterStatus(s.key)}
              style={{
                background: s.bg, color: s.color,
                borderRadius: 12, padding: "12px 18px",
                cursor: "pointer", flex: 1, minWidth: 90,
                textAlign: "center",
                border: `2px solid ${filterStatus === s.key ? s.color : "transparent"}`,
                transition: "border 0.15s",
              }}
            >
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search projects, remarks, funding source..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 2, minWidth: 220, padding: "10px 14px",
              border: "1px solid #DCE3DF", borderRadius: 10,
              fontSize: 13, color: C.tealDeep, background: "#fff", outline: "none",
            }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              flex: 1, minWidth: 150, padding: "10px 14px",
              border: "1px solid #DCE3DF", borderRadius: 10,
              fontSize: 13, color: C.tealDeep, background: "#fff",
            }}
          >
            <option value="all">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>

        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#8B9895" }}>
          Showing {filtered.length} of {projects.length} projects
          {filterStatus !== "all" && ` · filtered by ${filterStatus}`}
          {search && ` · matching "${search}"`}
        </p>

        {loading && <div style={{ textAlign: "center", padding: 60, color: C.tealMid }}>Loading projects…</div>}
        {error && (
          <div style={{ background: STATUS_STYLES.delayed.bg, border: `1px solid ${C.red}33`, borderRadius: 10, padding: 16, color: C.red }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.length === 0
              ? <div style={{ textAlign: "center", padding: 60, color: "#9AA6A3" }}>No projects match your search.</div>
              : filtered.map(p => <ProjectCard key={p.project_id} project={p} onClick={setSelected} />)
            }
          </div>
        )}

        <ProjectModal project={selected} onClose={() => setSelected(null)} />
          </>
)}
      </div>
    </div>
      
  );
} 