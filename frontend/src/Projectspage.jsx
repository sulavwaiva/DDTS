import { useState, useEffect } from "react";

const API = "http://localhost:3000/api";

/* ---------------- Design tokens ---------------- */
const C = {
  navy: "#002868",
  navyDeep: "#001B49",
  navyMid: "#123F82",
  blue: "#1F63B5",
  cyan: "#51B8E8",
  gold: "#F2B84B",
  red: "#D5402F",
  cream: "#F4F7FB",
  ink: "#15253F",
  muted: "#6F7F96",
  line: "#DCE5F1",
};

const STATUS_STYLES = {
  planned:   { color: C.blue, bg: "#EAF1F8", label: "Planned" },
  ongoing:   { color: C.gold, bg: "#FDF3E5", label: "Ongoing" },
  completed: { color: "#138A6A", bg: "#E8F7F1", label: "Completed" },
  delayed:   { color: C.red,  bg: "#FBEAE8", label: "Delayed" },
};

function formatBudget(val) {
  if (val == null || val === "") return "—";
  const n = parseFloat(val);
  if (n >= 10000000) return `Rs. ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `Rs. ${(n / 100000).toFixed(2)} Lakh`;
  return `Rs. ${n.toLocaleString()}`;
}

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.planned;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 11px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: ".6px",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

function ProjectCard({ project, onClick }) {
  const s = STATUS_STYLES[project.status] || STATUS_STYLES.planned;
  return (
    <div
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(project); } }}
      onClick={() => onClick(project)}
      style={{
        background: "#fff",
        border: `1px solid ${C.line}`,
        borderLeft: `4px solid ${s.color}`,
        borderRadius: "0 12px 12px 0",
        padding: "16px 20px",
        cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.1s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(8,34,33,0.08)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.ink, lineHeight: 1.4, flex: 1 }}>
          {project.name}
        </p>
        <Badge status={project.status} />
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.navy, fontWeight: 600 }}>{formatBudget(project.budget)}</span>
        {project.fiscal_year && <span style={{ fontSize: 12, color: "#7C8C89" }}>FY {project.fiscal_year}</span>}
        {project.funding_source && <span style={{ fontSize: 12, color: "#7C8C89" }}>{project.funding_source}</span>}
      </div>

      {project.remarks && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          {project.remarks.length > 100 ? project.remarks.slice(0, 100) + "…" : project.remarks}
        </p>
      )}
    </div>
  );
}

function ProjectModal({ project, onClose, isAdmin, onEdit, onDelete }) {
  if (!project) return null;
  const s = STATUS_STYLES[project.status] || STATUS_STYLES.planned;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,34,33,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "28px 32px",
          maxWidth: 640,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 24px 70px rgba(8,34,33,0.28)",
          borderTop: `4px solid ${s.color}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: C.ink, lineHeight: 1.4, flex: 1, paddingRight: 12 }}>
            {project.name}
          </h2>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>{isAdmin && <button className="ddts-btn ddts-plain" onClick={()=>onEdit(project)}>Edit</button>}{isAdmin && <button className="ddts-btn" style={{background:C.red}} onClick={()=>onDelete(project)}>Delete</button>}<button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted,padding:0,lineHeight:1}}>×</button></div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <Badge status={project.status} />
          {project.district_name && (
            <span
              style={{
                background: "#EEF4FC",
                color: C.navy,
                padding: "3px 11px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                border: `1px solid ${C.line}`,
              }}
            >
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
            <div key={label} style={{ background: "#F4F7FB", borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ margin: "0 0 3px", fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 700 }}>
                {label}
              </p>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.ink }}>{value}</p>
            </div>
          ))}
        </div>

        {project.details && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: "0 0 6px", fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 700 }}>
              Details
            </p>
            <p style={{ margin: 0, fontSize: 13.5, color: C.navyMid, lineHeight: 1.7 }}>{project.details}</p>
          </div>
        )}

        {project.remarks && (
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 700 }}>
              Remarks
            </p>
            <p style={{ margin: 0, fontSize: 13.5, color: C.navyMid, lineHeight: 1.7 }}>{project.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}


// Public DDTS endpoints; pass districtId to initialise selection from your parent page.
export default function ProjectsPage({ districtId = "", apiBase = API, token, user }) {
  const [districts, setDistricts] = useState([]);
  const [choice, setChoice] = useState(String(districtId || ""));
  const [projects, setProjects] = useState([]);
  const [districtError, setDistrictError] = useState("");
  const [districtLoading, setDistrictLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.role === "admin";
  const empty = { district_id:"", name:"", details:"", budget:"", funding_source:"", fiscal_year:"", start_date:"", completion_date:"", status:"planned", remarks:"" };
  const [form, setForm] = useState(empty);
  const base = apiBase.replace(/\/$/, "");
  useEffect(() => { setChoice(String(districtId || "")); }, [districtId]);

  useEffect(() => {
    const controller = new AbortController();
    setDistrictLoading(true); setDistrictError(""); setDistricts([]);
    async function load() {
      try {
        const res = await fetch(`${base}/districts`, { signal: controller.signal });
        const body = await res.json();
        if (!res.ok || !body.success || !Array.isArray(body.data)) throw new Error(body.message || "Could not load districts.");
        if (!controller.signal.aborted) setDistricts(body.data);
      } catch (e) { if (!controller.signal.aborted) setDistrictError(e.message || "Could not reach the server."); }
      finally { if (!controller.signal.aborted) setDistrictLoading(false); }
    }
    load(); return () => controller.abort();
  }, [base, retry]);

  useEffect(() => {
    const controller = new AbortController();
    setProjects([]); setSelected(null); setError(""); setSearch(""); setStatus("all");
    if (!choice) { setLoading(false); return () => controller.abort(); }
    setLoading(true);
    async function load() {
      try {
        const res = await fetch(`${base}/projects?districtId=${encodeURIComponent(choice)}`, { signal: controller.signal });
        const body = await res.json();
        if (!res.ok || !body.success || !Array.isArray(body.data)) throw new Error(body.message || "Could not load projects.");
        if (!controller.signal.aborted) setProjects(body.data);
      } catch (e) { if (!controller.signal.aborted) setError(e.message || "Could not reach the server."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load(); return () => controller.abort();
  }, [base, choice, retry]);

  useEffect(() => {
    if (!selected) return;
    const close = (e) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [selected]);

  const change = e => setForm(f => ({...f,[e.target.name]:e.target.value}));
  function openAdd(){setEditing(null);setForm({...empty,district_id:choice});setFormError("");setFormOpen(true)}
  function openEdit(p){setEditing(p);setForm({...empty,...p,start_date:p.start_date?String(p.start_date).slice(0,10):"",completion_date:p.completion_date?String(p.completion_date).slice(0,10):""});setFormError("");setSelected(null);setFormOpen(true)}
  async function save(e){e.preventDefault();setSaving(true);setFormError("");const body={...form,district_id:form.district_id?Number(form.district_id):null,budget:form.budget===""?null:Number(form.budget),details:form.details||null,funding_source:form.funding_source||null,fiscal_year:form.fiscal_year||null,start_date:form.start_date||null,completion_date:form.completion_date||null,remarks:form.remarks||null};if(editing)delete body.district_id;try{const r=await fetch(`${base}/projects${editing?`/${editing.project_id}`:""}`,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token||localStorage.getItem("token")}`},body:JSON.stringify(body)});const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"Could not save project");setFormOpen(false);setEditing(null);setRetry(n=>n+1)}catch(err){setFormError(err.message)}finally{setSaving(false)}}
  async function remove(p){if(!window.confirm(`Delete “${p.name}”?`))return;try{const r=await fetch(`${base}/projects/${p.project_id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token||localStorage.getItem("token")}`}});const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"Could not delete project");setSelected(null);setRetry(n=>n+1)}catch(err){setError(err.message)}}

  const district = districts.find(d => String(d.district_id) === choice);
  const counts = Object.fromEntries(Object.keys(STATUS_STYLES).map(key => [key, projects.filter(p => p.status === key).length]));
  const budget = projects.reduce((n, p) => n + (Number(p.budget) || 0), 0);
  const completion = projects.length ? Math.round(counts.completed / projects.length * 100) : 0;
  const filtered = projects.filter(p => (status === "all" || p.status === status) &&
    [p.name, p.remarks, p.funding_source].some(v => String(v || "").toLowerCase().includes(search.trim().toLowerCase())))
    .sort((a,b) => sort === "budget" ? (Number(b.budget)||0)-(Number(a.budget)||0) : sort === "name" ? String(a.name||"").localeCompare(String(b.name||"")) : (Date.parse(b.start_date)||0)-(Date.parse(a.start_date)||0));
  const due = projects.filter(p => p.status !== "completed" && p.completion_date && Number.isFinite(Date.parse(p.completion_date)))
    .sort((a,b) => Date.parse(a.completion_date)-Date.parse(b.completion_date)).slice(0,4);
  const ready = choice && !loading && !error;
  return <main className="ddts-projects">
    <style>{`
      .ddts-projects{--navy:#002868;background:#f3f7fc;color:#15253f;min-height:100vh;font:14px system-ui,sans-serif;padding:28px}
      .ddts-projects *{box-sizing:border-box}.ddts-projects button,.ddts-projects select,.ddts-projects input{font:inherit}
      .ddts-projects button{cursor:pointer}.ddts-projects :focus-visible{outline:3px solid #6699df;outline-offset:3px}
      .ddts-shell{max-width:1200px;margin:auto}.ddts-head{display:flex;align-items:center;justify-content:space-between;gap:24px;background:#fff;padding:24px 28px;border-top:4px solid var(--navy);box-shadow:0 3px 18px #00286808}
      .ddts-projects h1{font-size:25px;color:var(--navy);margin:5px 0}.ddts-projects h2{font-size:16px;margin:0 0 18px}.ddts-projects p{line-height:1.6}
      .ddts-muted{color:#64748b;font-size:12px}.ddts-picker{display:grid;gap:7px;min-width:235px;color:var(--navy);font-size:12px;font-weight:600}
      .ddts-projects select,.ddts-projects input{padding:11px 12px;border:1px solid #dce5f1;border-radius:7px;background:white;color:#15253f;max-width:100%}
      .ddts-layout{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:24px;margin-top:24px}.ddts-panel{background:#fff;border:1px solid #e5ebf3;border-radius:9px;padding:24px;box-shadow:0 4px 14px #00286807;margin-bottom:24px}
      .ddts-states{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.ddts-step{border:0;border-bottom:3px solid #dce5f1;background:#f8faff;padding:14px 5px;color:var(--navy);text-align:center;border-radius:5px}.ddts-step[aria-pressed=true]{background:#eaf1fc;border-color:var(--navy)}.ddts-step strong{display:block;font-size:23px;margin-bottom:5px}
      .ddts-toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}.ddts-toolbar input{flex:1;min-width:160px}.ddts-btn{background:var(--navy);color:white;border:0;border-radius:6px;padding:9px 13px}.ddts-plain{background:#edf3fc;color:var(--navy)}
      .ddts-ring{margin:20px auto;border-radius:50%;width:160px;height:160px;display:grid;place-items:center}.ddts-ring-inner{background:white;border-radius:50%;width:136px;height:136px;display:flex;flex-direction:column;justify-content:center;text-align:center}.ddts-ring strong{font-size:30px;color:var(--navy)}
      .ddts-budget{text-align:center;border-top:1px solid #e5ebf3;padding-top:20px}.ddts-budget strong{display:block;font-size:22px;color:var(--navy);margin:5px 0}.ddts-date{padding:14px 0;border-bottom:1px solid #eef2f7}.ddts-date p{margin:0 0 5px;font-weight:600}.ddts-empty{padding:35px 15px;text-align:center;color:#64748b}.ddts-error{color:#aa2a23;background:#fff0ee;padding:14px;border-radius:6px;margin:14px 0}
      @media(max-width:850px){.ddts-layout{grid-template-columns:1fr}.ddts-aside{display:grid;grid-template-columns:1fr 1fr;gap:16px}.ddts-head{flex-wrap:wrap}}
      @media(max-width:540px){.ddts-projects{padding:12px}.ddts-panel,.ddts-head{padding:18px}.ddts-aside{display:block}.ddts-states{grid-template-columns:repeat(2,1fr)}.ddts-picker{width:100%;min-width:0}}
    `}</style>
    <div className="ddts-shell">
      <header className="ddts-head"><div><span className="ddts-muted">DISTRICT DEVELOPMENT MANAGEMENT INFORMATION SYSTEM</span><h1>Development Projects</h1><p className="ddts-muted" style={{margin:0}}>{district ? `${district.district_name} · ${district.province || "District overview"}` : "Choose a district to explore its development projects."}</p></div>
        <label className="ddts-picker">District<select value={choice} disabled={districtLoading} onChange={e=>setChoice(e.target.value)}><option value="">{districtLoading ? "Loading districts…" : "Choose a district"}</option>{choice && !district && <option value={choice}>Selected district ({choice})</option>}{districts.map(d=><option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}</select></label>
      </header>
      {districtError && <div className="ddts-error" role="alert">{districtError} <button className="ddts-btn" onClick={()=>setRetry(n=>n+1)}>Retry</button></div>}
      {isAdmin && <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}><button className="ddts-btn" onClick={openAdd}>＋ Add project</button>{selected&&<button className="ddts-btn" style={{background:C.red}} onClick={()=>remove(selected)}>− Delete selected</button>}</div>}
      <div className="ddts-layout"><div>
        <section className="ddts-panel"><h2>Project overview <span className="ddts-muted"> / {ready ? projects.length : "—"} projects</span></h2><div className="ddts-states">{Object.entries(STATUS_STYLES).map(([key,s])=><button className="ddts-step" key={key} aria-pressed={status===key} onClick={()=>setStatus(status===key ? "all" : key)}><strong>{ready ? counts[key] : "—"}</strong>{s.label}</button>)}</div></section>
        <section className="ddts-panel"><h2>Projects</h2><div className="ddts-toolbar"><input aria-label="Search projects" placeholder="Search projects…" value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Status" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option>{Object.entries(STATUS_STYLES).map(([k,s])=><option key={k} value={k}>{s.label}</option>)}</select><select aria-label="Sort projects" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Latest start date</option><option value="budget">Highest budget</option><option value="name">Name A–Z</option></select><button className="ddts-btn ddts-plain" onClick={()=>{setSearch("");setStatus("all");setSort("newest");}}>Reset</button><button className="ddts-btn" onClick={()=>setView(view==="list" ? "grid" : "list")}>{view==="list" ? "Grid view" : "List view"}</button></div>
          {!choice ? <div className="ddts-empty">Choose a district above to view projects.</div> : loading ? <div className="ddts-empty" role="status">Loading projects…</div> : error ? <div className="ddts-error" role="alert">{error} <button className="ddts-btn" onClick={()=>setRetry(n=>n+1)}>Retry</button></div> : <><p className="ddts-muted" aria-live="polite">Showing {filtered.length} of {projects.length} projects</p><div style={{display:"grid",gap:12,gridTemplateColumns:view==="grid" ? "repeat(auto-fit,minmax(min(100%,260px),1fr))" : "1fr"}}>{filtered.map(p=><ProjectCard key={p.project_id} project={p} onClick={setSelected}/>)}</div>{!filtered.length && <div className="ddts-empty">{projects.length ? "No projects match your filters." : "No projects have been added for this district."}</div>}</>}
        </section>
      </div><aside className="ddts-aside">
        <section className="ddts-panel"><h2>Completion & budget</h2><div className="ddts-ring" style={{background:`conic-gradient(#002868 ${ready ? completion : 0}%, #e9eff7 0)`}}><div className="ddts-ring-inner"><strong>{ready && projects.length ? `${completion}%` : "—"}</strong><span className="ddts-muted">projects completed</span></div></div><p className="ddts-muted" style={{textAlign:"center"}}>{ready ? `${counts.completed} of ${projects.length} projects completed` : "Select a district to see totals"}</p><div className="ddts-budget"><span className="ddts-muted">Total allocated budget</span><strong>{ready ? formatBudget(budget) : "—"}</strong><span className="ddts-muted">Across all listed projects</span></div></section>
        <section className="ddts-panel"><h2>Scheduled completion</h2>{ready && due.length ? due.map(p=><div className="ddts-date" key={p.project_id}><p>{p.name}</p><span className="ddts-muted">{new Date(p.completion_date).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})}</span></div>) : <p className="ddts-muted">{ready ? "No open projects with completion dates." : "Project dates will appear here."}</p>}</section>
      </aside></div>
      <ProjectModal project={selected} isAdmin={isAdmin} onEdit={openEdit} onDelete={remove} onClose={()=>setSelected(null)}/>
      {formOpen && <div style={{position:"fixed",inset:0,zIndex:1100,background:"rgba(0,20,55,.45)",display:"grid",placeItems:"center",padding:20}}><form onSubmit={save} style={{background:"#fff",borderRadius:16,padding:24,width:"min(680px,100%)",maxHeight:"90vh",overflowY:"auto"}}><h2 style={{color:C.navy,marginTop:0}}>{editing?"Update project":"Add project"}</h2>{formError&&<div className="ddts-error">{formError}</div>}<div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>{[["name","Project name","text"],["budget","Budget","number"],["funding_source","Funding source","text"],["fiscal_year","Fiscal year","text"],["start_date","Start date","date"],["completion_date","Completion date","date"],["details","Details","text"],["remarks","Remarks","text"]].map(([n,l,t])=><label key={n} style={{display:"grid",gap:5,color:C.muted,fontSize:12,...((n==="details"||n==="remarks")?{gridColumn:"1/-1"}:{})}}>{l}<input name={n} type={t} value={form[n]||""} onChange={change} required={n==="name"} style={{padding:10,border:`1px solid ${C.line}`,borderRadius:7}}/></label>)}<label style={{display:"grid",gap:5,color:C.muted,fontSize:12}}>Status<select name="status" value={form.status} onChange={change} style={{padding:10,border:`1px solid ${C.line}`,borderRadius:7}}>{Object.entries(STATUS_STYLES).map(([k,s])=><option key={k} value={k}>{s.label}</option>)}</select></label>{!editing&&<label style={{display:"grid",gap:5,color:C.muted,fontSize:12}}>District<select name="district_id" value={form.district_id} onChange={change} required style={{padding:10,border:`1px solid ${C.line}`,borderRadius:7}}><option value="">Choose district</option>{districts.map(d=><option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}</select></label>}</div><div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:18}}><button type="button" className="ddts-btn ddts-plain" onClick={()=>setFormOpen(false)}>Cancel</button><button className="ddts-btn" disabled={saving}>{saving?"Saving…":editing?"Update project":"Add project"}</button></div></form></div>}
    </div>
  </main>;
}
