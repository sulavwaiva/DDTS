import { useState } from "react";
import LoginScreen from "./Loginscreen";
import SignupScreen from "./Signupscreen";
import Dashboard from "./Dashboard";
import DataPage from "./DataPage";
import ProjectsPage from "./ProjectsPage";
import FacilitiesPage from "./FacilitiesPage";
import { CitizenFeedbackPage, AdminFeedbackPage } from "./FeedbackPage";

const API_BASE = "http://localhost:3000/api/auth";

export default function App() {
  const [mode, setMode]       = useState("login");
  const [session, setSession] = useState(null);
  const [page, setPage]       = useState("map");

  const [phone, setPhone]     = useState("");
  const [password, setPassword] = useState("");
  const [suName, setSuName]   = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suDistrictId, setSuDistrictId] = useState("");

  const [error, setError]   = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function resetMessages() { setError(""); setNotice(""); }

  async function handleLogin(e) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || "Login failed"); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSession({ token: data.token, user: data.user });
    } catch { setError("Could not reach the server. Is it running?"); }
    finally { setLoading(false); }
  }

  async function handleSignup(e) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: suName, phone: suPhone, password: suPassword, district_id: suDistrictId || null }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || "Signup failed"); setLoading(false); return; }
      setPhone(suPhone);
      setPassword("");
      setSuName(""); setSuPhone(""); setSuPassword(""); setSuDistrictId("");
      setNotice("Account created. Sign in with your phone and password.");
      setMode("login");
    } catch { setError("Could not reach the server. Is it running?"); }
    finally { setLoading(false); }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSession(null);
    setPhone(""); setPassword("");
    setPage("map");
    resetMessages();
  }

  // ── Logged in ──────────────────────────────────────────────
  if (session) {
    const isAdmin = session.user.role === "admin";

    const NAV_ITEMS = [
      { key: "map",        label: "Map" },
      { key: "data",       label: "District Data" },
      { key: "projects",   label: "Projects" },
      { key: "facilities", label: "Facilities" },
      { key: "feedback",   label: isAdmin ? "Feedback (Admin)" : "Feedback" },
    ];

    return (
      <div style={{ minHeight: "100vh", background: "#f4f6f8" }}>

        {/* Navbar */}
        <nav style={{
          background: "#1a3c2e", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 52, position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: 1 }}>DDMS</span>
            <span style={{
              color: "#6aad84", fontSize: 11,
              background: "#0d2818", padding: "2px 8px",
              borderRadius: 10, fontWeight: 600,
            }}>Bhaktapur</span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {NAV_ITEMS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                style={{
                  padding: "6px 14px", borderRadius: 6, border: "none",
                  cursor: "pointer", fontSize: 13,
                  fontWeight: page === key ? 600 : 400,
                  background: page === key ? "#fff" : "transparent",
                  color: page === key ? "#1a3c2e" : "#a3c4a8",
                  transition: "all 0.15s",
                }}
              >
                {label}
                {key === "feedback" && page !== "feedback" && session.user.role === "admin" && (
                  <span style={{
                    marginLeft: 5, background: "#ef4444", color: "#fff",
                    borderRadius: 8, padding: "1px 5px", fontSize: 10, fontWeight: 700,
                  }}>
                    !
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* User + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#a3c4a8", fontSize: 13 }}>
              {session.user.name}
              <span style={{
                marginLeft: 6,
                background: isAdmin ? "#7c2d12" : "#2d5a3d",
                color: isAdmin ? "#fca5a5" : "#7ecf93",
                padding: "2px 8px", borderRadius: 10,
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px",
              }}>
                {session.user.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "5px 14px", fontSize: 12,
                border: "1px solid #2d5a3d", borderRadius: 6,
                background: "transparent", color: "#a3c4a8", cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Pages */}
        {page === "map"        && <Dashboard    user={session.user} token={session.token} onLogout={handleLogout} />}
        {page === "data"       && <DataPage     token={session.token} />}
        {page === "projects"   && <ProjectsPage token={session.token} />}
        {page === "facilities" && <FacilitiesPage />}
        {page === "feedback"   && (
          isAdmin
            ? <AdminFeedbackPage  token={session.token} />
            : <CitizenFeedbackPage token={session.token} user={session.user} />
        )}
      </div>
    );
  }

  // ── Auth screens ───────────────────────────────────────────
  if (mode === "signup") {
    return (
      <SignupScreen
        name={suName} phone={suPhone} password={suPassword} districtId={suDistrictId}
        error={error} loading={loading}
        onNameChange={setSuName} onPhoneChange={setSuPhone}
        onPasswordChange={setSuPassword} onDistrictIdChange={setSuDistrictId}
        onSubmit={handleSignup}
        onSwitchToLogin={() => { resetMessages(); setMode("login"); }}
      />
    );
  }

  return (
    <LoginScreen
      phone={phone} password={password} error={error} notice={notice} loading={loading}
      onPhoneChange={setPhone} onPasswordChange={setPassword}
      onSubmit={handleLogin}
      onSwitchToSignup={() => { resetMessages(); setMode("signup"); }}
    />
  );
}