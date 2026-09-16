import { useState } from "react";
import LoginScreen from "./Loginscreen";
import SignupScreen from "./Signupscreen";
import Dashboard from "./Dashboard";
import DataPage from "./Datapage";
import ProjectsPage from "./Projectspage";
import FacilitiesPage from "./Facilitiespage";
import { CitizenFeedbackPage, AdminFeedbackPage } from "./Feedbackpage";
import Profile from "./Profile";

const API_BASE = "http://localhost:3000/api/auth";
const NAVY = "#002868";

function SidebarIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 3v18M6 8h1.5M6 12h1.5M6 16h1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 8l4 4-4 4M8 12h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const authStyles = `
  .ddms-auth-shell { min-height: 100vh; width: 100%; overflow: hidden; background: ${NAVY}; }
  .ddms-auth-track { display: flex; width: 200%; min-height: 100vh; transform: translateX(0); transition: transform .55s cubic-bezier(.22,.61,.36,1); }
  .ddms-auth-track.signup-active { transform: translateX(-50%); }
  .ddms-auth-panel { flex: 0 0 50%; min-width: 50%; min-height: 100vh; }
  .ddms-logout-icon { display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
  @media (prefers-reduced-motion: reduce) { .ddms-auth-track { transition: none; } }
`;

export default function App() {
  const [mode, setMode] = useState("login");
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) return { token, user: JSON.parse(user) };
    return null;
  });
  const [page, setPage] = useState("map");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [suName, setSuName] = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suDistrictId, setSuDistrictId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function resetMessages() { setError(""); setNotice(""); }

  async function handleLogin(e) {
    e.preventDefault(); resetMessages(); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, password }) });
      const data = await res.json();
      if (!data.success) { setError(data.message || "Login failed"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSession({ token: data.token, user: data.user });
    } catch { setError("Could not reach the server. Is it running?"); }
    finally { setLoading(false); }
  }

  async function handleSignup(e) {
    e.preventDefault(); resetMessages(); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: suName, phone: suPhone, password: suPassword, district_id: suDistrictId || null }) });
      const data = await res.json();
      if (!data.success) { setError(data.message || "Signup failed"); return; }
      setPhone(suPhone); setPassword(""); setSuName(""); setSuPhone(""); setSuPassword(""); setSuDistrictId("");
      setNotice("Account created. Sign in with your phone and password.");
      setMode("login");
    } catch { setError("Could not reach the server. Is it running?"); }
    finally { setLoading(false); }
  }

  function handleLogout() {
    localStorage.removeItem("token"); localStorage.removeItem("user");
    setSession(null); setPhone(""); setPassword(""); setPage("map"); resetMessages();
  }

  if (session) {
    const isAdmin = session.user.role === "admin";
    const NAV_ITEMS = [
      { key: "map", label: "Map" }, { key: "data", label: "District Data" },
      { key: "projects", label: "Projects" }, { key: "facilities", label: "Facilities" },
      { key: "feedback", label: isAdmin ? "Feedback (Admin)" : "Feedback" },
    ];
    return (
      <div style={{ minHeight: "100vh", background: "#f4f6f8", paddingLeft: sidebarOpen ? 240 : 0, transition: "padding-left .35s ease" }}>
        <style>{`
          .ddms-sidebar { position: fixed; inset: 0 auto 0 0; width: 240px; z-index: 200; background: ${NAVY}; color: #fff; transform: translateX(0); transition: transform .35s cubic-bezier(.22,.61,.36,1); box-shadow: 8px 0 24px rgba(0,20,60,.18); }
          .ddms-sidebar.closed { transform: translateX(-100%); }
          .ddms-sidebar-link { width: 100%; border: 0; background: transparent; color: #d9e6fa; text-align: left; padding: 13px 22px; cursor: pointer; font-size: 14px; transition: background .2s, padding-left .2s; }
          .ddms-sidebar-link:hover, .ddms-sidebar-link.active { background: rgba(255,255,255,.16); padding-left: 28px; }
          .ddms-sidebar-toggle { position: fixed; left: 14px; top: 14px; z-index: 250; width: 40px; height: 40px; border: 0; border-radius: 9px; background: ${NAVY}; color: #fff; cursor: pointer; box-shadow: 0 4px 12px rgba(0,20,60,.25); }
          .ddms-sidebar-overlay { position: fixed; inset: 0; z-index: 150; background: rgba(0,0,0,.25); opacity: 0; pointer-events: none; transition: opacity .3s; }
          @media (max-width: 760px) { .ddms-sidebar { width: 250px; } .ddms-sidebar-overlay.open { opacity: 1; pointer-events: auto; } }
        `}</style>
        <aside className={`ddms-sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div style={{ padding: "24px 16px 20px", borderBottom: "1px solid rgba(255,255,255,.16)", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 2 }}>DDMIS</div>
            <div style={{ marginTop: 6, color: "#b8c9e6", fontSize: 12 }}>District Development Management Information System</div>
          </div>
          <div style={{ padding: "20px 10px" }}>
            {NAV_ITEMS.map(({ key, label }) => (
              <button key={key} className={`ddms-sidebar-link ${page === key ? "active" : ""}`} onClick={() => setPage(key)}>
                {label}
              </button>
            ))}
            <button className={`ddms-sidebar-link ${page === "profile" ? "active" : ""}`} onClick={() => setPage("profile")}>Profile</button>
          </div>
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 22, borderTop: "1px solid rgba(255,255,255,.16)", paddingTop: 16 }}>
            <div style={{ color: "#fff", fontSize: 13, marginBottom: 4 }}>{session.user.name}</div>
            <div style={{ color: "#b8c9e6", fontSize: 11, marginBottom: 12, textTransform: "uppercase" }}>{session.user.role}</div>
            <button onClick={handleLogout} className="ddms-logout-icon" style={{ width: "100%", justifyContent: "center", padding: "9px 12px", border: "1px solid #4c6f9f", borderRadius: 7, background: "transparent", color: "#fff", cursor: "pointer" }}><LogoutIcon /> Logout</button>
          </div>
        </aside>
        <div className={`ddms-sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
        <button className="ddms-sidebar-toggle" onClick={() => setSidebarOpen((v) => !v)} aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"} title={sidebarOpen ? "Close sidebar" : "Open sidebar"}>
          <SidebarIcon open={sidebarOpen} />
        </button>
        <main style={{ minHeight: "100vh", paddingTop: 12 }}>
          {page === "map" && <Dashboard user={session.user} token={session.token} />}
          {page === "data" && <DataPage token={session.token } user={session.user} districtId={session.user.district_id}/>}
          {page === "projects" && <ProjectsPage token={session.token} user={session.user} districtId={session.user.district_id} />}
          {page === "facilities" && <FacilitiesPage token={session.token} user={session.user} districtId={session.user.district_id}/>}
          {page === "feedback" && (isAdmin ? <AdminFeedbackPage token={session.token} /> : <CitizenFeedbackPage token={session.token} user={session.user} />)}
          {page === "profile" && <Profile user={session.user} onBack={() => setPage("map")} />}
        </main>
      </div>
    );
  }

  return (
    <div className="ddms-auth-shell">
      <style>{authStyles}</style>
      <div className={`ddms-auth-track ${mode === "signup" ? "signup-active" : ""}`}>
        <div className="ddms-auth-panel">
          <LoginScreen phone={phone} password={password} error={error} notice={notice} loading={loading} onPhoneChange={setPhone} onPasswordChange={setPassword} onSubmit={handleLogin} onSwitchToSignup={() => { resetMessages(); setMode("signup"); }} />
        </div>
        <div className="ddms-auth-panel">
          <SignupScreen name={suName} phone={suPhone} password={suPassword} districtId={suDistrictId} district={suDistrictId} error={error} loading={loading} onNameChange={setSuName} onPhoneChange={setSuPhone} onPasswordChange={setSuPassword} onDistrictIdChange={setSuDistrictId} onDistrictChange={setSuDistrictId} onSubmit={handleSignup} onSwitchToLogin={() => { resetMessages(); setMode("login"); }} />
        </div>
      </div>
    </div>
  );
}
