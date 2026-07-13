import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";

// Districts come from the public districts endpoint (no token needed).
const DISTRICTS_API = "http://localhost:3000/api/districts";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B7268] mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const selectClass =
  "w-full px-3 py-2.5 rounded-md border border-[#E3DFD3] bg-[#FAF9F5] text-[#26312B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4F3E]/30 focus:border-[#2F4F3E] disabled:opacity-50 disabled:cursor-not-allowed";

export default function SignupScreen({
  name,
  phone,
  password,
  districtId,
  error,
  loading,
  onNameChange,
  onPhoneChange,
  onPasswordChange,
  onDistrictIdChange,
  onSubmit,
  onSwitchToLogin,
}) {
  const [districts, setDistricts] = useState([]);

  // Load districts once on mount. The API only supports district_id on
  // signup — there is no municipality or ward concept in this backend.
  useEffect(() => {
    fetch(DISTRICTS_API)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setDistricts(result.data);
      })
      .catch((err) => console.error("Failed to load districts", err));
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F1EA] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2F4F3E] mb-4">
            <MapPin className="w-6 h-6 text-[#F4F1EA]" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-serif text-[#26312B] tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-[#6B7268] mt-1">
            For citizens of the district
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white border border-[#E3DFD3] rounded-lg p-6 shadow-sm space-y-4"
        >
          <Field label="Full Name">
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Evan Bir Karmacharya"
              required
              className={selectClass}
            />
          </Field>

          <Field label="Phone Number">
            <input
              type="text"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="98XXXXXXXX"
              required
              className={selectClass}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              required
              className={selectClass}
            />
          </Field>

          {/* district_id is optional per the API, so no "required" here */}
          <Field label="District (optional)">
            <select
              value={districtId}
              onChange={(e) => onDistrictIdChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Select a district</option>
              {districts.map((d) => (
                <option key={d.district_id} value={d.district_id}>
                  {d.district_name}
                </option>
              ))}
            </select>
          </Field>

          {error && (
            <div className="text-sm text-[#8B3A3A] bg-[#FBEDED] border border-[#F0D4D4] rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#2F4F3E] hover:bg-[#24402F] disabled:opacity-60 text-[#F4F1EA] text-sm font-medium py-2.5 rounded-md transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Creating account" : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-[#A3A095] mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#2F4F3E] font-medium hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}