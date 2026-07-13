import { useState } from "react";
import LoginScreen from "./Loginscreen";
import SignupScreen from "./Signupscreen";
import Dashboard from "./Dashboard";
import DataPage from "./DataPage";

const API_BASE = "http://localhost:3000/api/auth";

export default function App() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [session, setSession] = useState(null); // { token, user }
  const [page, setPage] = useState("map"); // "map" | "data"

  // login fields
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // signup fields — API only supports name, phone, password, district_id
  const [suName, setSuName] = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suDistrictId, setSuDistrictId] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function resetMessages() {
    setError("");
    setNotice("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSession({ token: data.token, user: data.user });
    } catch (err) {
      setError("Could not reach the server. Is it running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: suName,
          phone: suPhone,
          password: suPassword,
          // district_id is optional — omit rather than send an empty string
          ...(suDistrictId ? { district_id: suDistrictId } : {}),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }
      setPhone(suPhone);
      setPassword("");
      setSuName("");
      setSuPhone("");
      setSuPassword("");
      setSuDistrictId("");
      setNotice("Account created. Sign in with your phone and password.");
      setMode("login");
    } catch (err) {
      setError("Could not reach the server. Is it running?");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSession(null);
    setPhone("");
    setPassword("");
    setPage("map");
    resetMessages();
  }

  if (session) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f6f8" }}>
        <nav style={{
          background: "#1a3c2e",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#fff", fontWeight: "700", fontSize: "18px", letterSpacing: "1px" }}>
              DDMS
            </span>
            <span style={{ color: "#a3c4a8", fontSize: "13px" }}>Bhaktapur</span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {["map", "data"].map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: "7px 20px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  background: page === p ? "#fff" : "transparent",
                  color: page === p ? "#1a3c2e" : "#a3c4a8",
                  transition: "all 0.15s",
                }}
              >
                {p === "map" ? "Map" : "District Data"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#a3c4a8", fontSize: "13px" }}>
              {session.user.name}
              <span style={{
                marginLeft: "6px",
                background: "#2d5a3d",
                color: "#7ecf93",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
              }}>
                {session.user.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                border: "1px solid #2d5a3d",
                borderRadius: "6px",
                background: "transparent",
                color: "#a3c4a8",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        {page === "map"
          ? <Dashboard user={session.user} token={session.token} onLogout={handleLogout} />
          : <DataPage token={session.token} />
        }
      </div>
    );
  }

  if (mode === "signup") {
    return (
      <SignupScreen
        name={suName}
        phone={suPhone}
        password={suPassword}
        districtId={suDistrictId}
        error={error}
        loading={loading}
        onNameChange={setSuName}
        onPhoneChange={setSuPhone}
        onPasswordChange={setSuPassword}
        onDistrictIdChange={setSuDistrictId}
        onSubmit={handleSignup}
        onSwitchToLogin={() => { resetMessages(); setMode("login"); }}
      />
    );
  }

  return (
    <LoginScreen
      phone={phone}
      password={password}
      error={error}
      notice={notice}
      loading={loading}
      onPhoneChange={setPhone}
      onPasswordChange={setPassword}
      onSubmit={handleLogin}
      onSwitchToSignup={() => { resetMessages(); setMode("signup"); }}
    />
  );
}