import { useState } from "react";
export default function Profile({ user, onBack }) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  async function handleChangePassword() {
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Please fill in all password fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New password and confirm password do not match.");
    return;
  }

  if (newPassword.length < 8) {
    alert("New password must be at least 8 characters.");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:3000/api/auth/change-password",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Failed to change password.");
      return;
    }

    alert("Password updated successfully!");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false);

  } catch (error) {
    console.error("Change password error:", error);
    alert("Could not reach the server.");
  }
}
  return (
    <div
      style={{
        minHeight: "calc(100vh - 52px)",
        background: "#f4f6f8",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "transparent",
            color: "#1a3c2e",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          ← Back
        </button>

        <h1 style={{ color: "black" }}>
          My Profile
        </h1>

        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#1a3c2e",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
            fontWeight: "700",
            margin: "25px 0",
          }}
        >
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <p>
          <strong>Name:</strong> {user.name}
        </p>

        <p>
          <strong>Phone:</strong> {user.phone}
        </p>

        <p>
          <strong>Role:</strong> {user.role}
        </p>

        <button
  onClick={() => setShowPasswordForm(!showPasswordForm)}
  style={{
    marginTop: "20px",
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    background: "#1a3c2e",
    color: "#fff",
    cursor: "pointer",
  }}
>
  {showPasswordForm ? "Cancel" : "Change Password"}
</button>
{showPasswordForm && (
  <div style={{ marginTop: "25px" }}>
    <h2>Change Password</h2>

    <input
      type="password"
      placeholder="Current Password"
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
      style={{
        display: "block",
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        boxSizing: "border-box",
      }}
    />

    <input
      type="password"
      placeholder="New Password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      style={{
        display: "block",
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        boxSizing: "border-box",
      }}
    />

    <input
      type="password"
      placeholder="Confirm New Password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      style={{
        display: "block",
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        boxSizing: "border-box",
      }}
    />

    <button
      onClick={handleChangePassword}
      style={{
        padding: "10px 16px",
        border: "none",
        borderRadius: "6px",
        background: "#1a3c2e",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      Change Password
    </button>
  </div>
)}
        
      </div>
    </div>
  );
}