import { useState } from "react";

const NAVY = "#002868";

export default function Profile({ user, onBack }) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) return alert("Please fill in all password fields.");
    if (newPassword !== confirmPassword) return alert("New password and confirm password do not match.");
    if (newPassword.length < 8) return alert("New password must be at least 8 characters.");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) return alert(data.message || "Failed to change password.");
      alert("Password updated successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setShowPasswordForm(false);
    } catch (error) {
      console.error("Change password error:", error);
      alert("Could not reach the server.");
    }
  }

  const initials = (user?.name || "U").trim().charAt(0).toUpperCase();
  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "12px 13px", marginBottom: 11, border: "1px solid #d9e3f1", borderRadius: 9, color: NAVY, fontSize: 14, outline: "none" };
  const buttonStyle = { border: 0, borderRadius: 9, padding: "12px 18px", background: NAVY, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 };

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", padding: "44px 18px 60px", boxSizing: "border-box", background: "#eef4fc", backgroundImage: "radial-gradient(circle at 8% 15%, rgba(0,40,104,.10) 0 120px, transparent 121px), repeating-radial-gradient(circle at 95% 100%, rgba(0,40,104,.055) 0 8px, transparent 9px 27px)", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button onClick={onBack} style={{ border: 0, background: "transparent", color: NAVY, fontSize: 15, cursor: "pointer", padding: 0, marginBottom: 18 }}>← Back</button>
        <div style={{ background: "#fff", borderRadius: 22, overflow: "hidden", boxShadow: "0 22px 55px rgba(0,40,104,.16)", border: "1px solid rgba(0,40,104,.08)" }}>
          <div style={{ minHeight: 164, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #ffffff 0%, #f3f7fd 100%)", borderBottom: "1px solid #e1e9f4" }}>
            <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", right: -70, top: -150, background: "rgba(0,40,104,.06)" }} />
            <div style={{ position: "absolute", width: 170, height: 170, borderRadius: "50%", left: -85, bottom: -120, border: "30px solid rgba(0,40,104,.05)" }} />
            <div style={{ position: "relative", padding: "30px 34px", color: NAVY }}><div style={{ textAlign: "center", fontSize: 18, fontWeight: 800, letterSpacing: 3 }}>DDMS</div><h1 style={{ margin: "8px 0 0", fontSize: 31, textAlign: "center" }}>My Profile</h1><p style={{ margin: "6px 0 0", color: "#647895", fontSize: 14, textAlign: "center" }}>Manage your account and security settings</p></div>
          </div>
          <div style={{ padding: "0 34px 34px" }}>
            <div style={{ display: "flex", gap: 22, alignItems: "center", marginTop: -48, position: "relative" }}>
              <div style={{ width: 96, height: 96, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", background: "#fff", border: "7px solid #fff", boxShadow: "0 8px 20px rgba(0,40,104,.22)" }}><div style={{ width: "100%", height: "100%", borderRadius: "50%", display: "grid", placeItems: "center", background: NAVY, color: "#fff", fontSize: 37, fontWeight: 800 }}>{initials}</div></div>
              <div style={{ paddingTop: 48 }}><div style={{ color: NAVY, fontSize: 21, fontWeight: 800, overflowWrap: "anywhere" }}>{user?.name || "User"}</div><div style={{ color: "#71819a", fontSize: 13, marginTop: 3 }}>{user?.phone || "No phone number"}</div></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 13, marginTop: 27 }}>
              <div style={{ padding: "15px 16px", borderRadius: 12, background: "#f4f7fc", border: "1px solid #e5ebf4" }}><div style={{ color: "#7c8ba1", fontSize: 11, textTransform: "uppercase", letterSpacing: .7 }}>Phone</div><strong style={{ color: NAVY, display: "block", marginTop: 5, overflowWrap: "anywhere" }}>{user?.phone || "—"}</strong></div>
              <div style={{ padding: "15px 16px", borderRadius: 12, background: "#f4f7fc", border: "1px solid #e5ebf4" }}><div style={{ color: "#7c8ba1", fontSize: 11, textTransform: "uppercase", letterSpacing: .7 }}>Account role</div><strong style={{ color: NAVY, display: "block", marginTop: 5, textTransform: "capitalize" }}>{user?.role || "citizen"}</strong></div>
            </div>
            <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}><button onClick={() => setShowPasswordForm((open) => !open)} style={buttonStyle}>{showPasswordForm ? "Close password form" : "Change Password"}</button></div>
            {showPasswordForm && <div style={{ marginTop: 20, padding: 20, borderRadius: 14, background: "#f8faff", border: "1px solid #dbe5f3", animation: "profilePanelIn .28s ease" }}><h2 style={{ color: NAVY, fontSize: 19, margin: "0 0 15px" }}>Change Password</h2><input type="password" aria-label="Current Password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} /><input type="password" aria-label="New Password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} /><input type="password" aria-label="Confirm New Password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} /><button onClick={handleChangePassword} style={{ ...buttonStyle, width: "100%" }}>Save New Password</button></div>}
          </div>
        </div>
      </div>
      <style>{`@keyframes profilePanelIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
