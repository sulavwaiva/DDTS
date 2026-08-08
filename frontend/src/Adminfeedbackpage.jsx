import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:3000/api";

const STATUS_STYLES = {
  pending:  { bg: "#fff3e0", color: "#b45309", label: "Pending" },
  reviewed: { bg: "#e3f2fd", color: "#1565c0", label: "Reviewed" },
  resolved: { bg: "#e8f5ee", color: "#1a5c38", label: "Resolved" },
};

const STATUS_OPTIONS = ["pending", "reviewed", "resolved"];

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: "#f4f8f5", color: "#7a9e8a", label: status };
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    }}>
      {s.label}
    </span>
  );
}

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

export default function AdminFeedbackPage({ token }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [newStatus, setNewStatus] = useState("pending");
  const [changeNote, setChangeNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const loadList = useCallback(() => {
    setLoading(true);
    setError("");
    fetch(`${API}/feedback`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => {
        if (j.success) setFeedbackList(j.data);
        else setError(j.message || "Could not load feedback.");
      })
      .catch(() => setError("Could not reach the server."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  function openFeedback(id) {
    setSelectedId(id);
    setSelected(null);
    setDetailError("");
    setUpdateError("");
    setDetailLoading(true);

    fetch(`${API}/feedback/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setSelected(j.data);
          setNewStatus(j.data.status);
          setChangeNote("");
        } else {
          setDetailError(j.message || "Could not load this feedback.");
        }
      })
      .catch(() => setDetailError("Could not reach the server."))
      .finally(() => setDetailLoading(false));
  }

  async function handleStatusUpdate(e) {
    e.preventDefault();
    setUpdateError("");
    setUpdating(true);

    try {
      const res = await fetch(`${API}/feedback/${selectedId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, change_note: changeNote || undefined }),
      });
      const data = await res.json();
      if (!data.success) {
        setUpdateError(data.message || "Could not update status.");
        return;
      }
      openFeedback(selectedId); // refetch detail + history
      loadList(); // refresh list badges
    } catch (err) {
      setUpdateError("Could not reach the server.");
    } finally {
      setUpdating(false);
    }
  }

  const visibleList = filterStatus === "all"
    ? feedbackList
    : feedbackList.filter(f => f.status === filterStatus);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#1a3c2e" }}>
          Feedback Review
        </h1>
        <p style={{ margin: 0, color: "#7a9e8a", fontSize: 13 }}>
          {feedbackList.length.toLocaleString()} total submissions
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* ── List ── */}
        <div style={{ flex: "1 1 380px", minWidth: 320 }}>
          <Section title="All Feedback">
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {["all", ...STATUS_OPTIONS].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: "6px 14px", borderRadius: 20,
                    border: "1px solid #d0e4d8",
                    background: filterStatus === s ? "#1a5c38" : "#f4f8f5",
                    color: filterStatus === s ? "#fff" : "#2e4a38",
                    fontWeight: 600, fontSize: 12, cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "30px", color: "#7a9e8a" }}>
                Loading...
              </div>
            )}

            {error && (
              <div style={{
                background: "#fff5f5", border: "1px solid #fecaca",
                borderRadius: 8, padding: 16, color: "#b91c1c",
              }}>
                {error}
              </div>
            )}

            {!loading && !error && visibleList.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px", color: "#9eb8ab" }}>
                No feedback in this category.
              </div>
            )}

            {!loading && visibleList.map(f => (
              <div
                key={f.feedback_id}
                onClick={() => openFeedback(f.feedback_id)}
                style={{
                  padding: "12px 14px", borderRadius: 8, marginBottom: 8,
                  cursor: "pointer",
                  background: selectedId === f.feedback_id ? "#e8f5ee" : "#fafdfc",
                  border: selectedId === f.feedback_id ? "1px solid #1a5c38" : "1px solid #eef3f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#1a3c2e", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.details}
                  </p>
                  <StatusBadge status={f.status} />
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9eb8ab" }}>
                  {f.submitted_by_name || "Unknown user"} · {new Date(f.creation_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </Section>
        </div>

        {/* ── Detail panel ── */}
        <div style={{ flex: "1 1 380px", minWidth: 320 }}>
          <Section title="Feedback Detail">
            {!selectedId && (
              <div style={{ textAlign: "center", padding: "40px", color: "#9eb8ab" }}>
                Select a feedback item from the list to review it
              </div>
            )}

            {selectedId && detailLoading && (
              <div style={{ textAlign: "center", padding: "40px", color: "#7a9e8a" }}>
                Loading...
              </div>
            )}

            {detailError && (
              <div style={{
                background: "#fff5f5", border: "1px solid #fecaca",
                borderRadius: 8, padding: 16, color: "#b91c1c",
              }}>
                {detailError}
              </div>
            )}

            {selected && !detailLoading && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#7a9e8a" }}>
                      {selected.submitted_by_name || "Unknown user"} · {new Date(selected.creation_date).toLocaleDateString()}
                    </span>
                    <StatusBadge status={selected.status} />
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: "#1a3c2e", lineHeight: 1.5 }}>
                    {selected.details}
                  </p>
                </div>

                {/* Status update form */}
                <form onSubmit={handleStatusUpdate} style={{
                  padding: "14px", background: "#fafdfc",
                  border: "1px solid #eef3f0", borderRadius: 8, marginBottom: 16,
                }}>
                  <label style={{ display: "block", fontSize: 11, color: "#7a9e8a", marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>
                    Update Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    style={{
                      width: "100%", padding: "8px 10px", marginBottom: 10,
                      borderRadius: 6, border: "1px solid #d0e4d8",
                      fontSize: 13, color: "#1a3c2e", background: "#fff",
                    }}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} style={{ textTransform: "capitalize" }}>{s}</option>
                    ))}
                  </select>
                  <textarea
                    value={changeNote}
                    onChange={e => setChangeNote(e.target.value)}
                    placeholder="Optional note about this status change..."
                    rows={2}
                    style={{
                      width: "100%", padding: "8px 10px", marginBottom: 10,
                      borderRadius: 6, border: "1px solid #d0e4d8",
                      fontSize: 13, color: "#1a3c2e", background: "#fff",
                      resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                    }}
                  />
                  {updateError && (
                    <div style={{ marginBottom: 10, color: "#b91c1c", fontSize: 12 }}>
                      {updateError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={updating}
                    style={{
                      padding: "8px 20px", borderRadius: 6, border: "none",
                      background: updating ? "#a5d6a7" : "#1a5c38",
                      color: "#fff", fontWeight: 700, fontSize: 13,
                      cursor: updating ? "default" : "pointer",
                    }}
                  >
                    {updating ? "Saving..." : "Save Status"}
                  </button>
                </form>

                {/* History */}
                <div>
                  <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#7a9e8a", textTransform: "uppercase" }}>
                    Status History
                  </p>
                  {(!selected.history || selected.history.length === 0) && (
                    <p style={{ fontSize: 13, color: "#9eb8ab" }}>No status changes recorded yet.</p>
                  )}
                  {selected.history && selected.history.map(h => (
                    <div key={h.history_id || `${h.feedback_id}-${h.date}`} style={{
                      padding: "10px 0", borderBottom: "1px solid #f0f4f2",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <StatusBadge status={h.old_status} />
                        <span style={{ color: "#9eb8ab", fontSize: 12 }}>→</span>
                        <StatusBadge status={h.new_status} />
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#7a9e8a" }}>
                        {h.changed_by_name || "Unknown"} · {new Date(h.date).toLocaleString()}
                      </p>
                      {h.change_note && (
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#1a3c2e" }}>
                          {h.change_note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}