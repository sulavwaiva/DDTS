import { useState, useEffect, useRef, useMemo } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const API = "http://localhost:3000/api";

const CATEGORY_STYLES = {
  school:     { label: "Schools",     emoji: "🏫", color: "#1D4ED8", bg: "#EFF6FF" },
  healthcare: { label: "Healthcare",  emoji: "🏥", color: "#37669F", bg: "#F0F5FB" },
  bank:       { label: "Banks",       emoji: "🏦", color: "#B45309", bg: "#FFFBEB" },
  shelter:    { label: "Shelters",    emoji: "🏠", color: "#7C3AED", bg: "#F5F3FF" },
};

const PALETTE = ["#002868", "#3265A6", "#7197C6", "#A7C0DF", "#536580", "#447F95", "#8B9DB6"];
const textValue = value => value == null || String(value).trim() === "" ? "Not recorded" : String(value).trim();
function mapsUrl(record) {
  const hasCoordinates = Number.isFinite(Number(record.latitude)) && Number.isFinite(Number(record.longitude));
  const query = hasCoordinates ? `${record.latitude},${record.longitude}` : [record.name, record.address, record.district_name].filter(Boolean).join(", ");
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "";
}
function groupCounts(rows, field) {
  const groups = new Map();
  rows.forEach(row => { const key = textValue(row[field]); groups.set(key, (groups.get(key) || 0) + 1); });
  return [...groups].sort((a, b) => field === "ward" ? a[0].localeCompare(b[0], undefined, { numeric: true }) : b[1] - a[1]);
}
function countData(entries) {
  return { labels: entries.map(([label]) => label), datasets: [{ label: "Facilities", data: entries.map(([,n]) => n), backgroundColor: entries.map((_, i) => PALETTE[i % PALETTE.length]), borderColor: "#fff", borderWidth: 2 }] };
}
function chartOptions(type, horizontal = false, stacked = false) {
  const circular = type === "pie" || type === "doughnut";
  return {
    responsive: true, indexAxis: horizontal ? "y" : "x",
    plugins: { legend: { display: circular || stacked, position: "bottom", labels: { color: "#234671", boxWidth: 12 } },
      tooltip: { callbacks: { label: c => {
        if (circular) {
          const total = c.dataset.data.reduce((a,b) => a + b, 0);
          return `${c.label}: ${c.parsed} (${total ? (c.parsed / total * 100).toFixed(1) : 0}%)`;
        }
        return `${c.dataset.label}: ${horizontal ? c.parsed.x : c.parsed.y}`;
      } } } },
    ...(circular ? {} : { scales: {
      x: { stacked, beginAtZero: true, ticks: { color: "#647B9A", ...(horizontal ? { precision: 0 } : {}) }, grid: { display: horizontal, color: "#EDF2FA" } },
      y: { stacked, beginAtZero: true, ticks: { color: "#647B9A", ...(!horizontal ? { precision: 0 } : {}) }, grid: { display: !horizontal, color: "#EDF2FA" } }
    } })
  };
}
const centreTotal = {
  id: "facilityCentreTotal",
  afterDraw(chart) {
    if (chart.config.type !== "doughnut") return;
    const arc = chart.getDatasetMeta(0).data[0];
    if (!arc) return;
    const total = chart.data.datasets[0].data.reduce((sum, n, i) => sum + (chart.getDataVisibility(i) ? n : 0), 0);
    const ctx = chart.ctx; ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "#002868";
    ctx.font = "bold 22px system-ui"; ctx.fillText(String(total), arc.x, arc.y);
    ctx.font = "11px system-ui"; ctx.fillText("facilities", arc.x, arc.y + 19); ctx.restore();
  }
};

function ChartCanvas({ id, type, data, options, height = 240 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !data) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const chart = new Chart(ref.current, {
      type, data, plugins: [centreTotal],
      options: { ...options, maintainAspectRatio: false,
        animation: motion.matches ? false : { duration: 650, easing: "easeOutQuart" } },
    });
    const onMotion = () => {
      chart.options.animation = motion.matches ? false : { duration: 650, easing: "easeOutQuart" };
      if (motion.matches) chart.stop();
      chart.update("none");
    };
    motion.addEventListener("change", onMotion);
    return () => { motion.removeEventListener("change", onMotion); chart.destroy(); };
  }, [type, data, options]);
  return <div style={{ position: "relative", height }}><canvas id={id} ref={ref} role="img" aria-label={id.replaceAll("-", " ")} /></div>;
}

const TABS = ["all", "school", "healthcare", "bank", "shelter"];
function CategoryTabs({ category, counts, total, onChange }) {
  const buttons = useRef([]);
  const index = TABS.indexOf(category);
  useEffect(() => {
    buttons.current[index]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
  }, [index]);
  function onKey(e, i) {
    let next;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i + TABS.length - 1) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault(); onChange(TABS[next]); buttons.current[next]?.focus();
  }
  return <div className="facility-tabs-scroll"><div className="facility-tabs" role="tablist" aria-label="Facility categories">
    <span className="facility-tab-indicator" aria-hidden="true" style={{ transform: `translateX(${index * 100}%)` }} />
    {TABS.map((key, i) => <button type="button" key={key} ref={el => { buttons.current[i] = el; }}
      id={`facility-tab-${key}`} role="tab" aria-selected={category === key} aria-controls="facility-panel"
      tabIndex={category === key ? 0 : -1} onKeyDown={e => onKey(e, i)} onClick={() => onChange(key)}>
      <span>{key === "all" ? "All Facilities" : CATEGORY_STYLES[key].label}</span>
      <strong>{key === "all" ? total : counts[key]}</strong>
    </button>)}
  </div></div>;
}

function Section({ title, children }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #DEE6F0",
      borderRadius: 12, padding: "20px 24px", marginBottom: 20,
    }}>
      <h3 style={{
        margin: "0 0 16px", fontSize: 13, fontWeight: 700,
        color: "#002868", textTransform: "uppercase", letterSpacing: ".6px",
        borderBottom: "2px solid #EAF1FA", paddingBottom: 10,
      }}>{title}</h3>
      {children}
    </div>
  );
}

function FacilityRow({ f, isAdmin, onEdit, onDelete }) {
  const s = CATEGORY_STYLES[f.category];
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "12px 0", borderBottom: "1px solid #F0F4FA",
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{s?.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "#002868", display:"flex", alignItems:"center", gap:8 }}><span>{f.name}</span>{mapsUrl(f)&&<a href={mapsUrl(f)} target="_blank" rel="noreferrer" title="Open location in Google Maps" style={{fontSize:17,textDecoration:"none"}}>🗺️</a>}{isAdmin&&<span style={{marginLeft:"auto",display:"flex",gap:6}}><button type="button" onClick={()=>onEdit(f)} style={{border:"1px solid #002868",background:"#fff",color:"#002868",borderRadius:6,padding:"4px 9px",cursor:"pointer",fontSize:11}}>Edit</button><button type="button" onClick={()=>onDelete(f)} style={{border:"1px solid #fecaca",background:"#fff5f5",color:"#d5402f",borderRadius:6,padding:"4px 9px",cursor:"pointer",fontSize:11}}>Delete</button></span>}</p>
        <p style={{ margin: "0 0 2px", fontSize: 11, color: "#647B9A" }}>
          {f.type} · {f.ownership} · {f.ward}
        </p>
        {f.phone && <p style={{ margin: 0, fontSize: 11, color: "#002868" }}>📞 {f.phone}</p>}
        {f.address && <p style={{ margin: 0, fontSize: 11, color: "#7589A5" }}>📍 {f.address}</p>}
        {f.details && (
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#7589A5", lineHeight: 1.5 }}>{f.details}</p>
        )}
      </div>
    </div>
  );
}

export default function FacilitiesPage({ token, user,districtId: userDistrictId}) {
  const [all, setAll]           = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [category, setCategory] = useState("all");
  const [search, setSearch]     = useState("");
  const [direction, setDirection] = useState(1);
  function changeCategory(next) {
    setDirection(TABS.indexOf(next) >= TABS.indexOf(category) ? 1 : -1);
    setCategory(next);
  }

  const [districts, setDistricts] = useState([]);
  const [districtId, setDistrictId] = useState("");
  const [districtLoading, setDistrictLoading] = useState(true);
  const [districtError, setDistrictError] = useState("");
  const [retry, setRetry] = useState(0);
  const isAdmin = user?.role === "admin";
  const emptyFacility = { district_id:"", category:"school", name:"", type:"", ownership:"", ward:"", address:"", phone:"", details:"", latitude:"", longitude:"" };
  const [formOpen,setFormOpen] = useState(false);
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState(emptyFacility);
  const [saving,setSaving] = useState(false);
  const [formError,setFormError] = useState("");
  const selectedDistrict = districts.find(d => String(d.district_id) === districtId);
  const auth = { Authorization: `Bearer ${token || localStorage.getItem("token")}` };
  function openAdd(){setEditing(null);setForm({...emptyFacility,district_id:districtId});setFormError("");setFormOpen(true)}
  function openEdit(f){setEditing(f);setForm({...emptyFacility,...f});setFormError("");setFormOpen(true)}
  function change(e){setForm(v=>({...v,[e.target.name]:e.target.value}))}
  async function saveFacility(e){e.preventDefault();setSaving(true);setFormError("");const num=v=>v===""||v==null?null:Number(v);const body={...form,district_id:num(form.district_id),latitude:num(form.latitude),longitude:num(form.longitude)};if(editing){delete body.district_id;delete body.facility_id;delete body.district_name}try{const r=await fetch(`${API}/facilities${editing?`/${editing.facility_id}`:""}`,{method:editing?"PUT":"POST",headers:{...auth,"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"Could not save facility");setFormOpen(false);setEditing(null);setRetry(n=>n+1)}catch(err){setFormError(err.message)}finally{setSaving(false)}}
  async function removeFacility(f){if(!window.confirm(`Delete “${f.name}”?`))return;try{const r=await fetch(`${API}/facilities/${f.facility_id}`,{method:"DELETE",headers:auth});const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"Could not delete facility");setRetry(n=>n+1)}catch(err){setError(err.message)}}

  useEffect(() => {
    const controller = new AbortController();
    setDistrictLoading(true);
    setDistrictError("");
    async function loadDistricts() {
      try {
        const res = await fetch(`${API}/districts`, { signal: controller.signal });
        const body = await res.json();
        if (!res.ok || !body.success || !Array.isArray(body.data)) {
          throw new Error(body.message || body.error || "Could not load districts.");
        }
        if (!controller.signal.aborted) setDistricts(body.data);
      } catch (e) {
        if (!controller.signal.aborted) setDistrictError(e.message || "Could not reach the server.");
      } finally {
        if (!controller.signal.aborted) setDistrictLoading(false);
      }
    }
    loadDistricts();
    return () => controller.abort();
  }, [retry]);
useEffect(() => {
  if (!userDistrictId || districts.length === 0) return;

  const userDistrict = districts.find(
    d => String(d.district_id) === String(userDistrictId)
  );

  if (userDistrict) {
    setDistrictId(String(userDistrict.district_id));
  }
}, [userDistrictId, districts]);
  useEffect(() => {
    const controller = new AbortController();
    setAll([]);
    setError("");
    if (!districtId) {
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    async function loadFacilities() {
      try {
        const res = await fetch(`${API}/facilities?districtId=${encodeURIComponent(districtId)}`, { signal: controller.signal });
        const body = await res.json();
        if (!res.ok || !body.success || !Array.isArray(body.data)) {
          throw new Error(body.message || body.error || "Could not load facilities.");
        }
        if (!controller.signal.aborted) setAll(body.data);
      } catch (e) {
        if (!controller.signal.aborted) setError(e.message || "Could not reach the server.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadFacilities();
    return () => controller.abort();
  }, [districtId, retry]);

  const counts = {
    school:     all.filter(f => f.category === "school").length,
    healthcare: all.filter(f => f.category === "healthcare").length,
    bank:       all.filter(f => f.category === "bank").length,
    shelter:    all.filter(f => f.category === "shelter").length,
  };

  const filtered = useMemo(() => all.filter(f => {
    const matchCat    = category === "all" || f.category === category;
    const matchSearch = !search ||
      (f.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.address || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.type || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.ownership || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [all, category, search]);

  // Charts use the selected district, category and search results only.
  const charts = useMemo(() => {
    const title = category === "all" ? "Facilities" : CATEGORY_STYLES[category].label;
    const make = (id, heading, type, field, horizontal = false) => ({ id, heading, type,
      data: countData(groupCounts(filtered, field)), options: chartOptions(type, horizontal) });
    const ownership = make("ownership", `${title} by ownership · Pie`, "pie", "ownership");
    const wards = make("wards", `${title} by ward · Bar`, "bar", "ward", true);
    if (category === "school") return [make("school-types", "Schools by type · Column", "bar", "type"), ownership, wards];
    if (category === "healthcare") return [make("health-types", "Healthcare by type · Bar", "bar", "type", true), ownership, wards];
    if (category === "bank") return [ownership, make("bank-types", "Banks by type · Column", "bar", "type"), wards];
    if (category === "shelter") return [wards, ownership, make("shelter-types", "Shelters by type · Bar", "bar", "type", true)];
    const entries = TABS.slice(1).map(key => [CATEGORY_STYLES[key].label, filtered.filter(f => f.category === key).length]);
    const owners = groupCounts(filtered, "ownership").map(([label]) => label);
    const stack = { labels: entries.map(([label]) => label), datasets: owners.map((owner, i) => ({
      label: owner, backgroundColor: PALETTE[i % PALETTE.length],
      data: TABS.slice(1).map(key => filtered.filter(f => f.category === key && textValue(f.ownership) === owner).length)
    })) };
    return [
      { id: "categories", heading: "Facilities by category · Doughnut", type: "doughnut", data: countData(entries), options: chartOptions("doughnut") },
      { id: "category-comparison", heading: "Category counts · Bar", type: "bar", data: countData(entries), options: chartOptions("bar", true) },
      ownership,
      { id: "category-ownership", heading: "Ownership within categories · Stacked column", type: "bar", data: stack, options: chartOptions("bar", false, true) }
    ];
  }, [filtered, category]);

  return (
    <div className="facilities-animated" style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
      <style>{`
        .facilities-animated{font-family:system-ui,sans-serif;color:#002868}
        .facility-tabs-scroll{overflow-x:auto;margin-bottom:24px;padding:4px 0 8px}
        .facility-tabs{position:relative;display:grid;grid-template-columns:repeat(5,1fr);min-width:620px;background:#EDF2FA;border-radius:12px;isolation:isolate}
        .facility-tab-indicator{position:absolute;inset:0 auto 0 0;width:20%;border-radius:12px;background:#002868;box-shadow:0 4px 12px #00286820;transition:transform 320ms cubic-bezier(.22,1,.36,1);z-index:-1}
        .facility-tabs button{font:inherit;font-size:13px;display:flex;align-items:center;justify-content:center;gap:10px;padding:18px 10px;border:0;border-radius:12px;background:transparent;color:#002868;cursor:pointer;transition:color 200ms}
        .facility-tabs button[aria-selected=true]{color:white}.facility-tabs strong{font-size:12px;background:#00286812;padding:3px 7px;border-radius:20px}.facility-tabs button[aria-selected=true] strong{background:#ffffff26}
        .facilities-animated :focus-visible{outline:3px solid #769BCC;outline-offset:2px}
        .facility-panel-slide{animation:facilitySlide 320ms ease-out both}
        @keyframes facilitySlide{from{opacity:0;transform:translateX(var(--slide-from))}to{opacity:1;transform:translateX(0)}}
        .facility-chart-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;margin-bottom:20px}
        .facility-chart-grid>div{min-width:0}
        @media(max-width:700px){.facility-chart-grid{grid-template-columns:minmax(0,1fr)}}
        @media(prefers-reduced-motion:reduce){.facility-panel-slide{animation:none}.facility-tab-indicator,.facility-tabs button{transition:none}}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#002868" }}>
          Facilities{selectedDistrict ? ` — ${selectedDistrict.district_name}` : ""}
        </h1>
        <p style={{ margin: 0, color: "#647B9A", fontSize: 13 }}>
          Schools, Healthcare, Banks & Shelters {districtId && !loading && !error ? `· ${all.length} facilities total` : ""}
        </p>
      </div>

      <label style={{ display: "block", marginBottom: 20, color: "#002868", fontSize: 13, fontWeight: 600 }}>
        District
        <select
          aria-label="Choose a district"
          value={districtId}
          disabled={districtLoading}
          onChange={e => {
            setDistrictId(e.target.value);
            setAll([]);
            setLoading(Boolean(e.target.value));
            setError("");
            setCategory("all");
            setSearch("");
          }}
          style={{ display: "block", width: "100%", maxWidth: 360, marginTop: 8, padding: "11px 14px", border: "1px solid #002868", borderRadius: 8, background: "#fff", color: "#002868", fontSize: 14 }}
        >
          <option value="">{districtLoading ? "Loading districts…" : "Choose a district"}</option>
          {districts.map(d => <option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}
        </select>
      </label>
      {districtError && <div role="alert" style={{ color: "#b91c1c", marginBottom: 16 }}>{districtError} <button onClick={() => setRetry(n => n + 1)}>Retry</button></div>}
      {isAdmin && <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginBottom:20}}><button type="button" onClick={openAdd} style={{border:0,borderRadius:8,padding:"10px 16px",background:"#002868",color:"#fff",fontWeight:700,cursor:"pointer"}}>＋ Add facility</button></div>}
      {!districtId && !districtLoading && !districtError && <p style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Choose a district to view its facilities and charts.</p>}

      {loading && <div style={{ textAlign: "center", padding: 60, color: "#647B9A" }}>Loading...</div>}
      {error   && <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: 16, color: "#b91c1c" }}>{error} <button onClick={() => setRetry(n => n + 1)}>Retry</button></div>}

      {districtId && !loading && !error && (
        <>
          <CategoryTabs category={category} counts={counts} total={all.length} onChange={changeCategory} />
          <div key={`${districtId}-${category}`} id="facility-panel" role="tabpanel" tabIndex={0}
            aria-labelledby={`facility-tab-${category}`} className="facility-panel-slide"
            style={{ "--slide-from": direction > 0 ? "24px" : "-24px" }}>
           <p style={{ color: "#647B9A", fontSize: 13 }}>
             {category === "all" ? "District overview" : CATEGORY_STYLES[category].label} · {filtered.length} facilities{search ? ` matching “${search}”` : ""}
           </p>
           {filtered.length > 0 ? <div className="facility-chart-grid">
             {charts.map(chart => <Section key={chart.id} title={chart.heading}>
               <ChartCanvas id={chart.id} type={chart.type} data={chart.data} options={chart.options} height={280} />
             </Section>)}
           </div> : <p role="status" style={{ padding: 24, color: "#647B9A" }}>No facilities match this selection. Try another category or clear your search.</p>}

          {/* Search */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder={`Search ${category === "all" ? "all facilities" : CATEGORY_STYLES[category]?.label}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", boxSizing: "border-box",
                border: "1px solid #CCD9EB", borderRadius: 8,
                fontSize: 13, color: "#002868", background: "#FAFCFF",
              }}
            />
          </div>

          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#7589A5" }}>
            Showing {filtered.length} {category === "all" ? "facilities" : CATEGORY_STYLES[category]?.label.toLowerCase()}
            {search && ` matching "${search}"`}
          </p>

          {/* Facility list */}
          <Section title="Facility List">
            {filtered.length === 0 ? (
              <p style={{ color: "#7589A5", textAlign: "center", padding: 40 }}>No facilities found.</p>
            ) : (
              filtered.map(f => <FacilityRow key={f.facility_id} f={f} isAdmin={isAdmin} onEdit={openEdit} onDelete={removeFacility} />)
            )}
          </Section>
          </div>
        </>
      )}
      {formOpen && <div style={{position:"fixed",inset:0,zIndex:1100,background:"rgba(0,20,55,.45)",display:"grid",placeItems:"center",padding:20}}><form onSubmit={saveFacility} style={{background:"#fff",borderRadius:16,padding:24,width:"min(700px,100%)",maxHeight:"90vh",overflowY:"auto"}}><h2 style={{color:"#002868",marginTop:0}}>{editing?"Update facility":"Add facility"}</h2>{formError&&<div style={{color:"#b91c1c",background:"#fff5f5",padding:10,borderRadius:7,marginBottom:12}}>{formError}</div>}<div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>{[["name","Name","text"],["type","Type","text"],["ownership","Ownership","text"],["ward","Ward","text"],["address","Address","text"],["phone","Phone","text"],["details","Details","text"]].map(([n,l,t])=><label key={n} style={{display:"grid",gap:5,color:"#647B9A",fontSize:12,...((n==="address"||n==="details")?{gridColumn:"1/-1"}:{})}}>{l}<input name={n} type={t} value={form[n]??""} onChange={change} required={n==="name"} style={{padding:10,border:"1px solid #CCD9EB",borderRadius:7}}/></label>)}<label style={{display:"grid",gap:5,color:"#647B9A",fontSize:12}}>Category<select name="category" value={form.category} onChange={change} style={{padding:10,border:"1px solid #CCD9EB",borderRadius:7}}>{Object.entries(CATEGORY_STYLES).map(([k,s])=><option key={k} value={k}>{s.label}</option>)}</select></label>{!editing&&<label style={{display:"grid",gap:5,color:"#647B9A",fontSize:12}}>District ID<input name="district_id" type="number" min="1" value={form.district_id} onChange={change} required style={{padding:10,border:"1px solid #CCD9EB",borderRadius:7}}/></label>}</div><div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:18}}><button type="button" onClick={()=>setFormOpen(false)} style={{border:0,borderRadius:7,padding:"10px 14px",background:"#edf3fc",color:"#002868",cursor:"pointer"}}>Cancel</button><button disabled={saving} style={{border:0,borderRadius:7,padding:"10px 14px",background:"#002868",color:"#fff",fontWeight:700,cursor:"pointer"}}>{saving?"Saving…":editing?"Update facility":"Add facility"}</button></div></form></div>}
    </div>
  );
}
