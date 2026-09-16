import { useEffect, useState } from "react";
import DASHBOARD_ART from "./assets/dashboardArt.png";

const API = "http://localhost:3000/api";

export default function SignupScreen({
  name = "",
  phone = "",
  password = "",
  districtId = "",
  error = "",
  notice = "",
  loading = false,
  onNameChange,
  onPhoneChange,
  onPasswordChange,
  onDistrictIdChange,
  onDistrictChange,
  onSubmit,
  onSwitchToLogin,
}) {
  const [districts, setDistricts] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(true);
  const [districtError, setDistrictError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const changeDistrict =
    onDistrictIdChange || onDistrictChange;

  useEffect(() => {
    const controller = new AbortController();

    async function loadDistricts() {
      try {
        const response = await fetch(`${API}/districts`, {
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load districts.");
        }

        setDistricts(result.data || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setDistrictError(err.message);
        }
      } finally {
        setDistrictLoading(false);
      }
    }

    loadDistricts();

    return () => controller.abort();
  }, []);

  return (
    <main className="signup-page">
      <div className="signup-card">
        <section className="signup-form-panel">
          <h1>Create an account</h1>
          <p className="subtitle">
            Join DDMIS to access your district information.
          </p>

          {notice && <div className="success">{notice}</div>}
          {error && <div className="error">{error}</div>}

          <form onSubmit={onSubmit}>
            <label>Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange?.(e.target.value)}
              placeholder="Enter your full name"
              required
            />

            <label>Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange?.(e.target.value)}
              placeholder="Enter your phone number"
              maxLength={10}
              required
            />

            <label>Password</label>
            <div className="password-row">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => onPasswordChange?.(e.target.value)}
                placeholder="Create a password"
                minLength={8}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label>District</label>
            <select
              value={districtId}
              onChange={(e) => changeDistrict?.(e.target.value)}
              disabled={districtLoading || Boolean(districtError)}
              required
            >
              <option value="">
                {districtLoading
                  ? "Loading districts..."
                  : "Select your district"}
              </option>

              {districts.map((district) => (
                <option
                  key={district.district_id}
                  value={district.district_id}
                >
                  {district.district_name}
                </option>
              ))}
            </select>

            {districtError && (
              <p className="error-text">{districtError}</p>
            )}

            <button
              className="submit-button"
              type="submit"
              disabled={loading || districtLoading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="login-text">
            Already have an account?{" "}
            <button type="button" onClick={onSwitchToLogin}>
              Log In
            </button>
          </p>
        </section>

        <aside className="signup-image-panel">
          <img
            src={DASHBOARD_ART}
            alt="District development dashboard illustration"
          />
          <h2>Better information. Better decisions.</h2>
          <p>District Development Management Information System</p>
        </aside>
      </div>

      <style>{`
        .signup-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px;
          background: #f3f7fd;
          font-family: Inter, Arial, sans-serif;
        }

        .signup-card {
          width: min(1120px, 100%);
          min-height: 650px;
          display: grid;
          grid-template-columns: 0.9fr 1.25fr;
          background: white;
          border: 1px solid #dce5f3;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 40, 104, .16);
        }

        .signup-form-panel {
          padding: 58px 54px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .signup-form-panel h1 {
          margin: 0 0 10px;
          color: #002868;
          font-size: 32px;
        }

        .subtitle {
          margin: 0 0 28px;
          color: #64748b;
          font-size: 14px;
        }

        .signup-form-panel label {
          display: block;
          margin: 15px 0 7px;
          color: #334155;
          font-size: 13px;
          font-weight: 700;
        }

        .signup-form-panel input,
        .signup-form-panel select {
          width: 100%;
          height: 46px;
          box-sizing: border-box;
          padding: 0 12px;
          border: 1px solid #ccd9eb;
          border-radius: 8px;
          font-size: 14px;
          background: #fafcff;
        }

        .password-row {
          display: flex;
          gap: 6px;
        }

        .password-row input {
          flex: 1;
        }

        .password-row button {
          border: 0;
          border-radius: 8px;
          padding: 0 10px;
          color: #002868;
          background: #edf3fc;
          cursor: pointer;
        }

        .submit-button {
          width: 100%;
          height: 46px;
          margin-top: 24px;
          border: 0;
          border-radius: 8px;
          background: #002868;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .login-text {
          margin-top: 22px;
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }

        .login-text button {
          border: 0;
          background: none;
          color: #002868;
          font-weight: 700;
          cursor: pointer;
        }

        .signup-image-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
          background: #f7faff;
        }

        .signup-image-panel img {
          width: 100%;
          max-width: 520px;
          height: auto;
          object-fit: contain;
        }

        .signup-image-panel h2 {
          margin: 18px 0 8px;
          color: #002868;
          font-size: 22px;
        }

        .signup-image-panel p {
          margin: 0;
          color: #718198;
          font-size: 13px;
        }

        .error,
        .error-text {
          color: #b42318;
          font-size: 13px;
        }

        .success {
          color: #137333;
          font-size: 13px;
        }

        @media (max-width: 760px) {
          .signup-card {
            display: flex;
            flex-direction: column;
          }

          .signup-image-panel {
            order: -1;
            padding: 28px 20px;
          }

          .signup-image-panel img {
            max-width: 300px;
          }

          .signup-form-panel {
            padding: 34px 26px;
          }
        }
      `}</style>
    </main>
  );
}