import { MapPin, Phone, Lock, Loader2 } from "lucide-react";

export default function LoginScreen({
  phone,
  password,
  error,
  notice,
  loading,
  onPhoneChange,
  onPasswordChange,
  onSubmit,
  onSwitchToSignup,
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F1EA] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2F4F3E] mb-4">
            <MapPin className="w-6 h-6 text-[#F4F1EA]" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-serif text-[#26312B] tracking-tight">
            DDMS
          </h1>
          <p className="text-sm text-[#6B7268] mt-1">
            District Development Management System
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white border border-[#E3DFD3] rounded-lg p-6 shadow-sm"
        >
          {notice && (
            <div className="mb-4 text-sm text-[#2F4F3E] bg-[#EAF1EC] border border-[#CFE0D5] rounded-md px-3 py-2">
              {notice}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium text-[#6B7268] mb-1.5 uppercase tracking-wide">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A095]" />
              <input
                type="text"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="98XXXXXXXX"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-[#E3DFD3] bg-[#FAF9F5] text-[#26312B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4F3E]/30 focus:border-[#2F4F3E]"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-[#6B7268] mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A095]" />
              <input
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-[#E3DFD3] bg-[#FAF9F5] text-[#26312B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F4F3E]/30 focus:border-[#2F4F3E]"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-[#8B3A3A] bg-[#FBEDED] border border-[#F0D4D4] rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#2F4F3E] hover:bg-[#24402F] disabled:opacity-60 text-[#F4F1EA] text-sm font-medium py-2.5 rounded-md transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Signing in" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-[#A3A095] mt-6">
          New here?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-[#2F4F3E] font-medium hover:underline"
          >
            Create a citizen account
          </button>
        </p>
      </div>
    </div>
  );
}