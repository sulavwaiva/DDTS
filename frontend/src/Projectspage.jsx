import { useState, useEffect } from "react";

const API = "http://localhost:3000/api";

const STATUS_STYLES = {
  planned:   { bg: "#EFF6FF", color: "#1D4ED8", label: "Planned" },
  ongoing:   { bg: "#FFF7ED", color: "#C2410C", label: "Ongoing" },
  completed: { bg: "#F0FDF4", color: "#15803D", label: "Completed" },
  delayed:   { bg: "#FFF1F2", color: "#BE123C", label: "Delayed" },
};

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.planned;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: ".5px",
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

function formatBudget(val) {
  if (!val) return "—";
  const n = parseFloat(val);
  if (n >= 10000000) return `Rs. ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `Rs. ${(n / 100000).toFixed(2)} Lakh`;
  return `Rs. ${n.toLocaleString()}`;
}

function ProjectCard({ project, onClick }) {
  const s = STATUS_STYLES[project.status] || STATUS_STYLES.planned;
  return (
    <div
      onClick={() => onClick(project)}
      style={{
        background: "#fff",
        border: "1px solid #e5e9e6",
        borderLeft: `4px solid ${s.color}`,
        borderRadius: "0 10px 10px 0",
        padding: "16px 18px",
        cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.1s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1a3c2e", lineHeight: 1.4, flex: 1 }}>
          {project.name}
        </p>
        <Badge status={project.status} />
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#6b8f7a" }}>
          💰 {formatBudget(project.budget)}
        </span>
        {project.fiscal_year && (
          <span style={{ fontSize: 12, color: "#6b8f7a" }}>
            📅 FY {project.fiscal_year}
          </span>
        )}
        {project.funding_source && (
          <span style={{ fontSize: 12, color: "#6b8f7a" }}>
            🏛 {project.funding_source}
          </span>
        )}
      </div>

      {project.remarks && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9aada4", lineHeight: 1.5 }}>
          {project.remarks.length > 100 ? project.remarks.slice(0, 100) + "…" : project.remarks}
        </p>
      )}
    </div>
  );
}

function ProjectModal({ project, onClose }) {
  if (!project) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 14,
          padding: "28px 32px", maxWidth: 640, width: "100%",
          maxHeight: "80vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1a3c2e", lineHeight: 1.4, flex: 1, paddingRight: 12 }}>
            {project.name}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9aada4", padding: 0, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <Badge status={project.status} />
          {project.district_name && (
            <span style={{ background: "#e8f5ee", color: "#1a5c38", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
              {project.district_name}
            </span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            ["Budget", formatBudget(project.budget)],
            ["Funding Source", project.funding_source || "—"],
            ["Fiscal Year", project.fiscal_year || "—"],
            ["Start Date", project.start_date ? new Date(project.start_date).toLocaleDateString() : "—"],
            ["Completion Date", project.completion_date ? new Date(project.completion_date).toLocaleDateString() : "—"],
            ["District", project.district_name || "—"],
          ].map(([label, value]) => (
            <div key={label} style={{ background: "#f8fbf9", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ margin: "0 0 2px", fontSize: 11, color: "#9aada4", textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a3c2e" }}>{value}</p>
            </div>
          ))}
        </div>

        {project.details && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: "#9aada4", textTransform: "uppercase", letterSpacing: ".5px" }}>Details</p>
            <p style={{ margin: 0, fontSize: 13, color: "#2e4a38", lineHeight: 1.7 }}>{project.details}</p>
          </div>
        )}

        {project.remarks && (
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: "#9aada4", textTransform: "uppercase", letterSpacing: ".5px" }}>Remarks</p>
            <p style={{ margin: 0, fontSize: 13, color: "#2e4a38", lineHeight: 1.7 }}>{project.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage({ token }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/projects`, {
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
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.remarks || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.funding_source || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = {
    total:     projects.length,
    planned:   projects.filter(p => p.status === "planned").length,
    ongoing:   projects.filter(p => p.status === "ongoing").length,
    completed: projects.filter(p => p.status === "completed").length,
    delayed:   projects.filter(p => p.status === "delayed").length,
    budget:    projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0),
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#1a3c2e" }}>
          Development Projects
        </h1>
        <p style={{ margin: 0, color: "#7a9e8a", fontSize: 13 }}>
          Bhaktapur Municipality — Ward 5
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {[
          { label: "Total",     value: stats.total,     bg: "#f0f4f2", color: "#1a3c2e" },
          { label: "Planned",   value: stats.planned,   bg: "#EFF6FF", color: "#1D4ED8" },
          { label: "Ongoing",   value: stats.ongoing,   bg: "#FFF7ED", color: "#C2410C" },
          { label: "Completed", value: stats.completed, bg: "#F0FDF4", color: "#15803D" },
          { label: "Delayed",   value: stats.delayed,   bg: "#FFF1F2", color: "#BE123C" },
        ].map(s => (
          <div
            key={s.label}
            onClick={() => setFilterStatus(s.label.toLowerCase() === "total" ? "all" : s.label.toLowerCase())}
            style={{
              background: s.bg, color: s.color,
              borderRadius: 10, padding: "10px 18px",
              cursor: "pointer", flex: 1, minWidth: 80, textAlign: "center",
              border: `2px solid ${filterStatus === (s.label.toLowerCase() === "total" ? "all" : s.label.toLowerCase()) ? s.color : "transparent"}`,
              transition: "border 0.15s",
            }}
          >
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>{s.label}</p>
          </div>
        ))}
        <div style={{ background: "#f0f4f2", borderRadius: 10, padding: "10px 18px", flex: 1, minWidth: 120, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1a3c2e" }}>{formatBudget(stats.budget)}</p>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#7a9e8a", textTransform: "uppercase", letterSpacing: ".5px" }}>Total Budget</p>
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 2, minWidth: 200, padding: "9px 14px",
            border: "1px solid #d0e4d8", borderRadius: 8,
            fontSize: 13, color: "#1a3c2e", background: "#fafdfc",
          }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            flex: 1, minWidth: 140, padding: "9px 14px",
            border: "1px solid #d0e4d8", borderRadius: 8,
            fontSize: 13, color: "#1a3c2e", background: "#fafdfc",
          }}
        >
          <option value="all">All Statuses</option>
          <option value="planned">Planned</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      {/* Results count */}
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#9aada4" }}>
        Showing {filtered.length} of {projects.length} projects
        {filterStatus !== "all" && ` · filtered by ${filterStatus}`}
        {search && ` · matching "${search}"`}
      </p>

      {/* Loading / error */}
      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "#7a9e8a" }}>Loading projects...</div>
      )}
      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: 16, color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {/* Project list */}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#9aada4" }}>
              No projects match your search.
            </div>
          ) : (
            filtered.map(p => (
              <ProjectCard key={p.project_id} project={p} onClick={setSelected} />
            ))
          )}
        </div>
      )}

      {/* Detail modal */}
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}