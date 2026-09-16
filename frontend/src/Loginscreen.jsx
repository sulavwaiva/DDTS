import { useId, useState } from "react";
import logo from "./assets/logo.png";
import DASHBOARD_ART from "./assets/dashboardArt.png";
// Logo is embedded so this component needs no separate image or CSS file.
// const DDMIS_LOGO = "base64";

export default function LoginScreen({
  phone = "",
  password = "",
  error,
  notice,
  loading = false,
  onPhoneChange,
  onPasswordChange,
  onSubmit,
  onSwitchToSignup,
  
}) {
  const [showPass, setShowPass] = useState(false);
  const id = useId();
  return (
    <main className="ddms-sapphire">
      <style>{`
        .ddms-sapphire { --sapphire:#002868; --ink:#172B4D; min-height:100vh; min-height:100dvh; padding:40px 24px; display:flex; align-items:center; justify-content:center; background:#F3F7FD; font-family:Inter,'Segoe UI',sans-serif; color:var(--ink); box-sizing:border-box; }
        .ddms-sapphire *, .ddms-sapphire *::before, .ddms-sapphire *::after { box-sizing:border-box; }
        .ddms-sapphire button, .ddms-sapphire input { font:inherit; }
        .ddms-sapphire button { cursor:pointer; }
        .ddms-sapphire button:focus-visible, .ddms-sapphire a:focus-visible { outline:3px solid #60A5FA; outline-offset:4px; }
        .ddms-sapphire .login-card { width:100%; max-width:1080px; display:grid; grid-template-columns:1.12fr 1fr; min-height:650px; background:white; border:1px solid #DCE5F3; border-radius:22px; overflow:hidden; box-shadow:0 24px 55px -20px #00286855,0 5px 15px #17355D0D; }
        .ddms-sapphire .brand-panel { position:relative; background:var(--sapphire); color:white; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:60px 36px; }
        .ddms-sapphire .brand-kicker { position:absolute; top:30px; left:32px; font-size:11px; font-weight:600; letter-spacing:2px; color:#D6E7FF; }
        .ddms-sapphire .logo-frame { width:228px; height:228px; padding:10px; background:white; border-radius:50%; box-shadow:0 0 0 12px #FFFFFF0C; margin:12px 0 30px; }
        .ddms-sapphire .logo-frame img { display:block; width:100%; height:100%; object-fit:contain; border-radius:50%; }
        .ddms-sapphire .brand-panel h2 { font-size:27px; font-weight:650; letter-spacing:-.5px; margin:0 0 12px; }
        .ddms-sapphire .brand-description { max-width:310px; margin:0; font-size:14px; line-height:1.8; color:#DCEBFF; }
        .ddms-sapphire .brand-line { width:36px; height:3px; border-radius:5px; background:#80BCFF; margin-top:28px; }
        .ddms-sapphire .brand-footer { position:absolute; bottom:26px; margin:0; font-size:11px; color:#D6E7FF; }
        .ddms-sapphire .form-panel { display:flex; flex-direction:column; justify-content:center; padding:54px 52px 30px; }
        .ddms-sapphire .form-content { width:100%; max-width:340px; margin:auto; }
        .ddms-sapphire h1 { text-align:center; font-size:29px; line-height:1.2; letter-spacing:-.6px; margin:0 0 10px; font-weight:650; }
        .ddms-sapphire .subtitle { text-align:center; font-size:13px; color:#64748B; line-height:1.6; margin:0 0 32px; }
        .ddms-sapphire label { display:block; font-size:12px; font-weight:600; margin:0 0 8px; color:#3E506A; }
        .ddms-sapphire .input-wrap { position:relative; margin-bottom:19px; }
        .ddms-sapphire .input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#8291A5; pointer-events:none; }
        .ddms-sapphire input { width:100%; height:48px; border:1px solid #D8E1EE; border-radius:8px; background:#fff; color:var(--ink); padding:0 43px; font-size:13px; outline:none; transition:border-color .15s,box-shadow .15s; }
        .ddms-sapphire input::placeholder { color:#7D8A9B; }
        .ddms-sapphire input:focus { border-color:var(--sapphire); box-shadow:0 0 0 3px #00286816; }
        .ddms-sapphire .password-toggle { position:absolute; right:5px; top:2px; height:44px; width:40px; display:grid; place-items:center; color:#718198; background:none; border:0; border-radius:5px; }
        .ddms-sapphire .forgot { display:flex; justify-content:flex-end; margin:-5px 0 25px; }
        .ddms-sapphire .text-button { border:0; padding:0; background:none; color:var(--sapphire); font-size:12px; }
        .ddms-sapphire .text-button:hover { text-decoration:underline; }
        .ddms-sapphire .primary, .ddms-sapphire .register { width:100%; min-height:46px; border-radius:24px; font-size:13px; font-weight:600; transition:background .15s; }
        .ddms-sapphire .primary { background:var(--sapphire); border:1px solid var(--sapphire); color:white; }
        .ddms-sapphire .primary:hover:not(:disabled) { background:#001C4A; }
        .ddms-sapphire button:disabled { cursor:not-allowed; opacity:.6; }
        .ddms-sapphire .register { color:var(--sapphire); border:1px solid #A5BBDC; background:#fff; }
        .ddms-sapphire .register:hover { background:#EFF6FF; }
        .ddms-sapphire .register-caption { font-size:12px; color:#64748B; text-align:center; margin:25px 0 12px; }
        .ddms-sapphire .message { padding:11px 13px; margin:0 0 18px; border-radius:8px; font-size:13px; line-height:1.5; background:#EFF6FF; color:#174D91; border:1px solid #BFDBFE; }
        .ddms-sapphire .message.error { background:#FFF1F2; color:#B42335; border-color:#FECDD3; }
        .ddms-sapphire .form-footer { margin:30px 0 0; text-align:center; font-size:11px; line-height:1.8; color:#7B889B; }
        .ddms-sapphire .form-footer a { color:#002868; text-decoration:none; }
        .ddms-sapphire .terms { text-align:center; margin-top:20px; }
        @media(max-width:760px) { .ddms-sapphire {padding:20px 12px;} .ddms-sapphire .login-card {grid-template-columns:1fr;max-width:480px;min-height:0;} .ddms-sapphire .brand-panel {padding:34px 24px 30px;} .ddms-sapphire .brand-kicker,.ddms-sapphire .brand-footer,.ddms-sapphire .brand-line {display:none;} .ddms-sapphire .logo-frame {width:116px;height:116px;padding:5px;margin:0 0 20px;} .ddms-sapphire .brand-panel h2 {font-size:23px;} .ddms-sapphire .brand-description {font-size:12px;line-height:1.6;} .ddms-sapphire .form-panel {padding:32px 26px 25px;} .ddms-sapphire .subtitle {margin-bottom:25px;} }
        @media(prefers-reduced-motion:reduce) { .ddms-sapphire * {transition:none!important;} }

        /* Navy reference layout: small brand, left form, right artwork. */
        .ddms-sapphire { background:radial-gradient(ellipse at 105% -8%,#CFDEF4 0%,#E3ECF9 24%,transparent 25%),radial-gradient(ellipse at -8% 108%,#BBCFE9 0%,#DFE9F6 26%,transparent 27%),#F4F7FC; padding:48px 28px; }
        .ddms-sapphire .login-card { max-width:1180px; min-height:700px; grid-template-columns:0.86fr 1.35fr; grid-template-rows:auto 1fr; border:2px solid #002868; border-radius:28px; padding:28px 34px 30px; box-shadow:0 24px 70px -35px #00286850; }
        .ddms-sapphire .brand-header { grid-column:1/-1; display:flex; align-items:center; gap:10px; padding:0 0 14px; }
        .ddms-sapphire .brand-header img { width:48px;height:48px;object-fit:contain; }
        .ddms-sapphire .brand-header span { display:block; font-size:9px; letter-spacing:2.1px; color:#586D8A; margin-bottom:3px; }
        .ddms-sapphire .brand-header strong { display:block; color:#002868; font-size:17px;letter-spacing:.5px; }
        .ddms-sapphire .brand-header small {font-size:10px;font-weight:500;color:#6B7D95;margin-left:5px;}
        .ddms-sapphire .form-panel { grid-column:1;grid-row:2; padding:42px 22px 10px; }
        .ddms-sapphire .form-content {max-width:310px;}
        .ddms-sapphire h1 {text-align:left;color:#002868;font-size:38px;font-weight:650;letter-spacing:-1.2px;}
        .ddms-sapphire .subtitle {text-align:left;max-width:275px;font-size:13px;line-height:1.7;margin-bottom:30px;}
        .ddms-sapphire label {font-size:11px;letter-spacing:.3px;}
        .ddms-sapphire input {background:#FAFCFF;border-color:#D9E2F0;border-radius:7px;}
        .ddms-sapphire .primary {border-radius:7px;box-shadow:0 7px 15px #00286815;}
        .ddms-sapphire .register {border-radius:7px;}
        .ddms-sapphire .register-caption {margin-top:23px;}
        .ddms-sapphire .terms {margin-top:18px;}
        .ddms-sapphire .terms button {font-size:10px;color:#61738D;}
        .ddms-sapphire .form-footer {font-size:10px;margin-top:27px;}
        .ddms-sapphire .hero-panel {grid-column:2;grid-row:2;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:5px 0 35px 20px;min-width:0;}
        .ddms-sapphire .hero-panel img {width:100%;height:auto;display:block;}
        .ddms-sapphire .hero-panel p {font-size:18px;font-weight:600;color:#002868;letter-spacing:-.3px;margin:12px 0 9px;}
        .ddms-sapphire .hero-panel span {font-size:11px;line-height:1.6;color:#667D9B;}
        @media(max-width:900px) and (min-width:761px) {.ddms-sapphire .login-card{padding:24px;grid-template-columns:1fr 1.15fr;}.ddms-sapphire .form-panel{padding:30px 10px 10px;}.ddms-sapphire .hero-panel{padding-left:10px;}}
        @media(max-width:760px) {.ddms-sapphire{padding:22px 14px;}.ddms-sapphire .login-card{display:flex;flex-direction:column;min-height:0;max-width:480px;padding:24px 20px;border-radius:20px;}.ddms-sapphire .brand-header{padding:0 0 15px;}.ddms-sapphire .brand-header img{width:42px;height:42px;}.ddms-sapphire .form-panel{padding:24px 4px 6px;}.ddms-sapphire .hero-panel{display:none;}.ddms-sapphire h1{font-size:34px;}.ddms-sapphire .form-content{max-width:100%;}}

        /* Compact, unified brand header. */
        .ddms-sapphire .login-card {border:1px solid #D7E1EE;border-radius:22px;min-height:660px;padding:28px 34px 24px;}
        .ddms-sapphire .brand-header {gap:11px;padding:0 0 20px;margin:0 22px;border-bottom:1px solid #EDF1F7;}
        .ddms-sapphire .brand-header img {width:44px;height:44px;flex-shrink:0;}
        .ddms-sapphire .brand-header strong {font-size:16px;line-height:1.4;font-weight:650;letter-spacing:-.3px;}
        .ddms-sapphire .brand-header span {font-size:10px;line-height:1.5;letter-spacing:.1px;margin:2px 0 0;color:#728097;}
        .ddms-sapphire .form-panel {padding-top:26px;}
        .ddms-sapphire .form-content {margin:0 auto;}
        .ddms-sapphire h1 {font-size:32px;letter-spacing:-.8px;}
        .ddms-sapphire .hero-panel {padding-top:0;}
        @media(max-width:760px) {.ddms-sapphire .login-card{padding:22px 20px;min-height:0;}.ddms-sapphire .brand-header{margin:0;padding-bottom:18px;}.ddms-sapphire .form-panel{padding-top:26px;}.ddms-sapphire .brand-header img{width:40px;height:40px;}.ddms-sapphire h1{font-size:30px;}}
      `}</style>
      <div className="login-card">
        <header className="brand-header">
          <img src={logo} alt="Discover DDMIS 2026 logo" />
          <div>
            <strong>Discover DDMIS</strong>
            <span>District information portal</span>
          </div>
        </header>
        <aside className="hero-panel" aria-label="District data illustration">
          <img
            src={DASHBOARD_ART}
            alt="Two people exploring a dashboard with charts and district data"
          />
          <p>Better information. Better decisions.</p>
          <span>District Development Management Information System</span>
        </aside>
        <section className="form-panel" aria-labelledby={`${id}-title`}>
          <div className="form-content">
            <h1 id={`${id}-title`}>Login</h1>
            <p className="subtitle">
              Welcome back. Access your district information.
            </p>
            {notice && (
              <div className="message" role="status">
                {notice}
              </div>
            )}
            <form onSubmit={onSubmit} aria-busy={loading}>
              <label htmlFor={`${id}-phone`}>Phone number</label>
              <div className="input-wrap">
                <svg
                  className="input-icon"
                  width="17"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <rect x="6" y="2" width="12" height="20" rx="3" />
                  <path d="M10 18h4" />
                </svg>
                <input
                  id={`${id}-phone`}
                  type="tel"
                  autoComplete="username"
                  value={phone}
                  onChange={(e) => onPhoneChange?.(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <label htmlFor={`${id}-password`}>Password</label>
              <div className="input-wrap">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
                </svg>
                <input
                  id={`${id}-password`}
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => onPasswordChange?.(e.target.value)}
                  placeholder="Enter your password"
                  required
                  aria-describedby={error ? `${id}-error` : undefined}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  aria-pressed={showPass}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {showPass && <path d="m3 3 18 18" />}
                  </svg>
                </button>
              </div>
              
              {error && (
                <div id={`${id}-error`} className="message error" role="alert">
                  {error}
                </div>
              )}
              <button type="submit" className="primary" disabled={loading}>
                {loading ? "Logging in…" : "Log in"}
              </button>
            </form>
            <p className="register-caption">Don't have an account yet?</p>
            <button
              type="button"
              className="register"
              onClick={onSwitchToSignup}
            >
              Register now
            </button>
            
          </div>
          <p className="form-footer">
            Need help?{" "}
            <a href="mailto:ddmis.support2026@gmail.com">ddmis.support2026@gmail.com</a>
          </p>
        </section>
      </div>
    </main>
  );
}
