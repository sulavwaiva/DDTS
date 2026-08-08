import { useState, useEffect } from "react";

function Field({ placeholder, value, onChange, type = "text", hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 12 }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "14px 16px",
          fontSize: 16, borderRadius: 10,
          border: focused ? "1px solid #1a3c2e" : "1px solid #ddd",
          background: focused ? "#fff" : "#f5f6f7",
          boxSizing: "border-box",
          outline: "none", color: "#1c1e21",
          transition: "all 0.15s",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {hint && (
        <p style={{ margin: "4px 0 0 4px", fontSize: 12, color: "#777" }}>{hint}</p>
      )}
    </div>
  );
}

export default function SignupScreen({
  name, phone, password, districtId, error, loading,
  onNameChange, onPhoneChange, onPasswordChange, onDistrictIdChange,
  onSubmit, onSwitchToLogin,
}) {
  const [showPass, setShowPass] = useState(false);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/districts")
      .then(r => r.json())
      .then(d => { if (d.success) setDistricts(d.data); })
      .catch(() => {});
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f2f5",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>

      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{
          margin: "0 0 6px",
          fontSize: 40,
          fontWeight: 800,
          color: "#1a3c2e",
          letterSpacing: "-1px",
        }}>
          DDMS
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: "#555" }}>
          Create a new account
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "24px 20px",
        width: "100%",
        maxWidth: 432,
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
      }}>

        <p style={{ margin: "0 0 18px", fontSize: 14, color: "#606770", textAlign: "center" }}>
          It's quick and easy.
        </p>

        <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "0 0 18px" }} />

        <form onSubmit={onSubmit}>
          <Field
            placeholder="Full name"
            value={name}
            onChange={e => onNameChange(e.target.value)}
          />

          <Field
            placeholder="Phone number"
            value={phone}
            onChange={e => onPhoneChange(e.target.value)}
          />

          <div style={{ position: "relative", marginBottom: 12 }}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => onPasswordChange(e.target.value)}
              placeholder="New password"
              required
              style={{
                width: "100%", padding: "14px 52px 14px 16px",
                fontSize: 16, borderRadius: 10,
                border: "1px solid #ddd",
                background: "#f5f6f7",
                boxSizing: "border-box",
                outline: "none", color: "#1c1e21",
              }}
              onFocus={e => { e.target.style.border = "1px solid #1a3c2e"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.border = "1px solid #ddd"; e.target.style.background = "#f5f6f7"; }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute", right: 14, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none",
                cursor: "pointer", color: "#606770",
                fontSize: 13, fontWeight: 600,
              }}
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <select
  value={districtId}
  onChange={(e) => onDistrictIdChange(e.target.value)}
  required
  style={{
    width: "100%",
    padding: "14px 16px",
    fontSize: 15,
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#f5f6f7",
    boxSizing: "border-box",
    outline: "none"
  }}
>
  <option value="">-- Select District --</option>

  {districts.map((district) => (
    <option
      key={district.district_id}
      value={district.district_id}
    >
      {district.district_name}
    </option>
  ))}
</select>
          </div>

          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#777", lineHeight: 1.5, textAlign: "center" }}>
            By clicking Sign Up, you agree that your account will be created as a <strong>citizen</strong> account.
            Admin access is granted by the district office.
          </p>

          {error && (
            <div style={{
              marginBottom: 14, padding: "10px 14px",
              background: "#fff0f0", border: "1px solid #ffcdd2",
              borderRadius: 8, fontSize: 13, color: "#c62828",
            }}>
              {error}
            </div>
          )}

          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#4a8f6a" : "#7ecf93",
                color: "#1a3c2e",
                border: "none", borderRadius: 10,
                padding: "14px 48px",
                fontSize: 17, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = "#5db87a"; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = "#7ecf93"; }}
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </div>
        </form>

        <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "0 0 16px" }} />

        <div style={{ textAlign: "center" }}>
          <button
            onClick={onSwitchToLogin}
            style={{
              background: "none", border: "none",
              color: "#1a3c2e", fontSize: 14,
              fontWeight: 700, cursor: "pointer",
            }}
          >
            Already have an account? Log in
          </button>
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: "#777", textAlign: "center" }}>
        Bhaktapur District · Nepal
      </p>
    </div>
  );
}