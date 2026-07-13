import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const API = "http://localhost:3000/api";

// ── Chart wrapper ──────────────────────────────────────────────
function ChartCanvas({ id, type, data, options, height = 260 }) {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current || !data) return;
    if (instance.current) instance.current.destroy();
    instance.current = new Chart(ref.current, { type, data, options });
    return () => { if (instance.current) instance.current.destroy(); };
  }, [JSON.stringify(data)]);

  return <canvas ref={ref} style={{ height, maxHeight: height }} />;
}

// ── Small stat card ────────────────────────────────────────────
function Card({ label, value, sub }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e0e9e4",
      borderRadius: 10, padding: "14px 18px",
      flex: 1, minWidth: 130,
    }}>
      <p style={{ margin: 0, fontSize: 11, color: "#7a9e8a", textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</p>
      <p style={{ margin: "5px 0 2px", fontSize: 20, fontWeight: 700, color: "#1a3c2e" }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: 11, color: "#9eb8ab" }}>{sub}</p>}
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────
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

function EmptyState({ children }) {
  return (
    <div style={{ textAlign: "center", padding: "60px", color: "#9eb8ab" }}>
      {children}
    </div>
  );
}

// ── Shared chart options ───────────────────────────────────────
const barOpts = (suffix = "") => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (c) => ` ${c.parsed.y.toLocaleString()}${suffix}` } },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: "#f0f4f2" }, ticks: { color: "#7a9e8a" } },
    x: { grid: { display: false }, ticks: { color: "#2e4a38" } },
  },
});

const doughnutOpts = {
  responsive: true,
  plugins: {
    legend: { position: "right", labels: { color: "#2e4a38", padding: 12, font: { size: 12 } } },
    tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.parsed}%` } },
  },
};

const GREEN = ["#1a5c38","#2e7d52","#43a570","#66bb8a","#98d4b0","#c8e6c9","#a5d6a7","#81c784"];

// ══════════════════════════════════════════════════════════════
// NOTE ON THE API: there is no municipality level and no /api/data
// or /api/locations routes. Districts are listed via GET /api/districts
// and a single district's full record comes from GET /api/districts/:name
// (looked up by name, not id). Only Bhaktapur (has_full_data: 1) returns
// non-null values for the detail fields below — every other district
// returns null for them, so those sections show a "not available" state.
// ══════════════════════════════════════════════════════════════
export default function DataPage({ token }) {
  const [districts, setDistricts] = useState([]);
  const [districtName, setDistrictName] = useState("");
  const [tab, setTab]               = useState("population");
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // load districts on mount (public endpoint, no token needed)
  useEffect(() => {
    fetch(`${API}/districts`)
      .then(r => r.json())
      .then(j => { if (j.success) setDistricts(j.data); })
      .catch(() => setError("Could not reach server."));
  }, []);

  // load the selected district's full record
  useEffect(() => {
    setData(null);
    if (!districtName) return;
    setLoading(true); setError("");
    fetch(`${API}/districts/${encodeURIComponent(districtName)}`)
      .then(r => r.json())
      .then(j => { if (j.success) setData(j.data); else setError(j.message); })
      .catch(() => setError("Could not reach server."))
      .finally(() => setLoading(false));
  }, [districtName]);

  const d = data;
  const hasDetail = !!(d && d.literacy_rate != null);

  // ── Population charts ──────────────────────────────────────
  const popBarData = d ? {
    labels: ["Male", "Female"],
    datasets: [{
      label: "Population",
      data: [d.no_of_male, d.no_of_female],
      backgroundColor: ["#2e7d52", "#81c995"],
      borderRadius: 6, borderSkipped: false,
    }],
  } : null;

  // ── Education charts ───────────────────────────────────────
  const eduBarData = hasDetail ? {
    labels: ["Overall", "Male", "Female"],
    datasets: [{
      label: "Literacy Rate (%)",
      data: [
        parseFloat(d.literacy_rate),
        parseFloat(d.literate_male_rate),
        parseFloat(d.literate_female_rate),
      ],
      backgroundColor: ["#1a5c38","#2e7d52","#66bb8a"],
      borderRadius: 6, borderSkipped: false,
    }],
  } : null;

  // ── Water chart (proportions 0-1 → %) ───────────────────────
  const waterData = hasDetail ? (() => {
    const pairs = [
      ["Tap (within)",   d.tap_within_compound],
      ["Tap (outside)",  d.tap_outside_compound],
      ["Tubewell",       d.tubewell],
      ["Covered well",   d.covered_well],
      ["Uncovered well", d.uncovered_well],
      ["Spout water",    d.spout_water],
      ["River/stream",   d.river_stream],
      ["Jar/bottle",     d.jar_bottle],
      ["Other",          d.water_other],
    ].filter(([, v]) => v > 0);
    return {
      labels: pairs.map(([l]) => l),
      datasets: [{
        data: pairs.map(([, v]) => Math.round(v * 100)),
        backgroundColor: GREEN,
        borderWidth: 2, borderColor: "#fff",
      }],
    };
  })() : null;

  // ── Employment charts (proportions 0-1 → %) ─────────────────
  const workData = hasDetail ? {
    labels: ["Below 3 months","3–6 months","6+ months","Did not work"],
    datasets: [{
      label: "%",
      data: [
        Math.round(d.work_below_3months * 100),
        Math.round(d.work_3to6months    * 100),
        Math.round(d.work_6months_plus  * 100),
        Math.round(d.did_not_work       * 100),
      ],
      backgroundColor: ["#2e7d52","#43a570","#66bb8a","#c8e6c9"],
      borderRadius: 6, borderSkipped: false,
    }],
  } : null;

  const sectorData = hasDetail ? {
    labels: ["Government","Financial","Non-Financial","Non-Profit","Household"],
    datasets: [{
      data: [
        Math.round(d.sector_government    * 100),
        Math.round(d.sector_financial     * 100),
        Math.round(d.sector_non_financial * 100),
        Math.round(d.sector_non_profit    * 100),
        Math.round(d.sector_household     * 100),
      ],
      backgroundColor: GREEN.slice(0, 5),
      borderWidth: 2, borderColor: "#fff",
    }],
  } : null;

  const TABS = ["population", "education", "economy"];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#1a3c2e" }}>
          District Data
        </h1>
        <p style={{ margin: 0, color: "#7a9e8a", fontSize: 13 }}>
          National Population and Housing Census 2078
        </p>
      </div>

      {/* ── District dropdown ── */}
      <div style={{
        background: "#fff", border: "1px solid #e0e9e4",
        borderRadius: 12, padding: "16px 20px",
        display: "flex", gap: 20, flexWrap: "wrap",
        alignItems: "flex-end", marginBottom: 24,
      }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: "block", fontSize: 11, color: "#7a9e8a", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px" }}>
            Select a district
          </label>
          <select
            value={districtName}
            onChange={e => setDistrictName(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px",
              borderRadius: 8, border: "1px solid #d0e4d8",
              fontSize: 14, color: "#1a3c2e", background: "#fafdfc",
              cursor: "pointer",
            }}
          >
            <option value="">Select</option>
            {districts.map(dd => (
              <option key={dd.district_id} value={dd.district_name}>
                {dd.district_name}{dd.has_full_data ? " ★" : ""}
              </option>
            ))}
          </select>
        </div>

        {districtName && (
          <div style={{
            padding: "8px 14px", borderRadius: 8,
            background: hasDetail ? "#e8f5ee" : "#fff3e0",
            color: hasDetail ? "#1a5c38" : "#b45309",
            fontSize: 12, fontWeight: 600,
          }}>
            {hasDetail ? "Full data available" : "Population only"}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      {districtName && (
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 22px", borderRadius: "8px 8px 0 0",
                border: "1px solid #e0e9e4",
                borderBottom: tab === t ? "2px solid #fff" : "1px solid #e0e9e4",
                background: tab === t ? "#fff" : "#f4f8f5",
                color: tab === t ? "#1a3c2e" : "#7a9e8a",
                fontWeight: tab === t ? 700 : 400,
                fontSize: 13, cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* ── States ── */}
      {!districtName && (
        <div style={{
          textAlign: "center", padding: "80px 0",
          color: "#9eb8ab", fontSize: 15,
        }}>
          Select a district to view data
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "60px", color: "#7a9e8a" }}>
          Loading...
        </div>
      )}

      {error && (
        <div style={{
          background: "#fff5f5", border: "1px solid #fecaca",
          borderRadius: 8, padding: 16, color: "#b91c1c", marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {/* ══ POPULATION TAB ══ */}
      {!loading && d && tab === "population" && (
        <>
          <Section title="Population Highlights">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <Card
                label="Total Population"
                value={d.total_population.toLocaleString()}
                sub="Census 2078"
              />
              <Card
                label="Male"
                value={d.no_of_male.toLocaleString()}
                sub={`${((d.no_of_male / d.total_population) * 100).toFixed(1)}%`}
              />
              <Card
                label="Female"
                value={d.no_of_female.toLocaleString()}
                sub={`${((d.no_of_female / d.total_population) * 100).toFixed(1)}%`}
              />
              {d.total_households != null && (
                <Card
                  label="Households"
                  value={d.total_households.toLocaleString()}
                  sub={d.avg_household_size ? `Avg ${d.avg_household_size}/household` : ""}
                />
              )}
              {d.sex_ratio != null && (
                <Card label="Sex Ratio" value={d.sex_ratio} sub="males per 100 females" />
              )}
            </div>

            <div style={{ maxWidth: 400, margin: "0 auto" }}>
              <ChartCanvas
                id={`pop-${districtName}`}
                type="bar"
                data={popBarData}
                options={barOpts()}
              />
            </div>
          </Section>

          {/* Water shown in population tab since it's census data */}
          {hasDetail && (
            <Section title="Drinking Water Sources">
              <div style={{ maxWidth: 600, margin: "0 auto" }}>
                <ChartCanvas
                  id={`water-${districtName}`}
                  type="doughnut"
                  data={waterData}
                  options={doughnutOpts}
                  height={300}
                />
              </div>
            </Section>
          )}
        </>
      )}

      {/* ══ EDUCATION TAB ══ */}
      {!loading && d && tab === "education" && (
        hasDetail ? (
          <Section title="Literacy Rate">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <Card label="Overall Literacy" value={`${d.literacy_rate}%`} />
              <Card label="Male Literacy" value={`${d.literate_male_rate}%`} />
              <Card label="Female Literacy" value={`${d.literate_female_rate}%`} />
            </div>
            <div style={{ maxWidth: 450, margin: "0 auto" }}>
              <ChartCanvas
                id={`edu-${districtName}`}
                type="bar"
                data={eduBarData}
                options={barOpts("%")}
              />
            </div>
          </Section>
        ) : (
          <EmptyState>Data not available for {districtName}</EmptyState>
        )
      )}

      {/* ══ ECONOMY TAB ══ */}
      {!loading && d && tab === "economy" && (
        hasDetail ? (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <Section title="Months Worked (last 12 months)">
                <ChartCanvas
                  id={`work-${districtName}`}
                  type="bar"
                  data={workData}
                  options={barOpts("%")}
                />
              </Section>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <Section title="Employment Sector">
                <ChartCanvas
                  id={`sector-${districtName}`}
                  type="doughnut"
                  data={sectorData}
                  options={doughnutOpts}
                  height={280}
                />
              </Section>
            </div>
          </div>
        ) : (
          <EmptyState>Data not available for {districtName}</EmptyState>
        )
      )}
    </div>
  );
}