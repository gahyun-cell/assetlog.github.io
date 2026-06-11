import React, { useState, useEffect } from "react";
import { Link2, Lock, User, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, KeyRound } from "lucide-react";
import { UserCareerProfile, CareerAsset } from "../types";

interface AuthScreenProps {
  onAuthSuccess: (username: string, profile: UserCareerProfile | null, assets: CareerAsset[], isNewUser: boolean) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Migration detection: check if there's existing unregistered data in localStorage
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [offlineName, setOfflineName] = useState("");

  useEffect(() => {
    const offlineProfile = localStorage.getItem("assetlog_profile");
    if (offlineProfile) {
      try {
        const parsed = JSON.parse(offlineProfile);
        if (parsed && parsed.name) {
          setHasOfflineData(true);
          setOfflineName(parsed.name);
        }
      } catch (e) {
        // Safe check
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setErrorMsg("아이디를 입력해주세요.");
      return;
    }
    if (!password) {
      setErrorMsg("비밀번호를 입력해주세요.");
      return;
    }

    // Load registered users
    const usersStr = localStorage.getItem("assetlog_registered_users") || "[]";
    let users: any[] = [];
    try {
      users = JSON.parse(usersStr);
    } catch (e) {
      users = [];
    }

    // Try to find matching user
    const foundUser = users.find(
      (u) => u.username.trim().toLowerCase() === username.trim().toLowerCase()
    );

    if (!foundUser) {
      setErrorMsg("등록되지 않은 아이디입니다. 회원가입을 먼저 진행해주세요!");
      return;
    }

    if (foundUser.password !== password) {
      setErrorMsg("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      return;
    }

    // Success! Load their profile and assets
    setSuccessMsg("성공적으로 로그인되었습니다!");
    setTimeout(() => {
      onAuthSuccess(foundUser.username, foundUser.profile || null, foundUser.assets || [], false);
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setErrorMsg("설정할 아이디를 입력해주세요.");
      return;
    }
    if (cleanUsername.length < 3) {
      setErrorMsg("아이디는 최소 3글자 이상이어야 합니다.");
      return;
    }
    if (!password) {
      setErrorMsg("비밀번호를 설정해주세요.");
      return;
    }
    if (password.length < 4) {
      setErrorMsg("비밀번호는 안전을 위해 최소 4글자 이상이어야 합니다.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("비밀번호 확인이 설정한 비밀번호와 일치하지 않습니다.");
      return;
    }

    // Load existing users
    const usersStr = localStorage.getItem("assetlog_registered_users") || "[]";
    let users: any[] = [];
    try {
      users = JSON.parse(usersStr);
    } catch (e) {
      users = [];
    }

    // Check pre-existence
    const exists = users.some(
      (u) => u.username.trim().toLowerCase() === cleanUsername.toLowerCase()
    );

    if (exists) {
      setErrorMsg("이미 사용 중인 아이디입니다. 다른 아이디를 설정해주세요.");
      return;
    }

    // Define initial profile and empty assets as instructed: "그리고 가입하자마자 에셋 이력이 있으면 안돼"
    const registeredProfile: UserCareerProfile | null = null; // Forces onboarding wizard to start next
    const registeredAssets: CareerAsset[] = []; // Clear assets explicitly!

    // Add new user
    const newUser = {
      username: cleanUsername,
      password: password,
      profile: registeredProfile,
      assets: registeredAssets
    };

    users.push(newUser);
    localStorage.setItem("assetlog_registered_users", JSON.stringify(users));

    setSuccessMsg("회원가입이 완료되었습니다! 맞춤 온보딩 정원으로 이동합니다.");
    setTimeout(() => {
      onAuthSuccess(cleanUsername, registeredProfile, registeredAssets, true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-[430px] flex-col overflow-y-auto bg-slate-50 font-sans shadow-2xl">
      {/* Visual Identity Hero Grid */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#f3fbf6] via-[#fbfcfa] to-[#ffffff] px-6 pt-12 pb-8 text-center border-b border-emerald-100/40">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-emerald-500/5 blur-3xl"></div>
        <div className="absolute -left-12 -bottom-10 h-32 w-32 rounded-full bg-emerald-300/10 blur-2xl"></div>
        
        {/* Styled Logo Signature */}
        <div className="relative mb-3 flex items-center justify-center">
          <svg viewBox="0 0 320 180" className="w-52 h-24 relative z-10 filter drop-shadow-sm transition-transform duration-500 hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="auth-grad-left" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0B6B45" />
                <stop offset="60%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
              <linearGradient id="auth-grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>

            <path 
              d="M 95 130 C 95 130 110 90 140 60 C 170 30 190 25 180 25 C 160 25 125 55 102 100 C 88 125 95 130 95 130 Z" 
              fill="url(#auth-grad-left)" 
            />
            <path 
              d="M 102 100 C 115 112 138 116 165 111 C 178 109 174 100 160 102 C 132 106 115 104 102 100 Z" 
              fill="url(#auth-grad-right)" 
              opacity="0.9"
            />
            <path 
              d="M 183 25 C 183 25 170 30 170 43 L 170 115 C 170 135 178 138 215 138 C 228 138 235 132 228 132 C 210 132 188 134 184 118 L 184 25 Z" 
              fill="url(#auth-grad-right)" 
            />
            <path 
              d="M 183 85 C 190 76 222 35 226 38 C 230 42 206 95 184 113 Z" 
              fill="url(#auth-grad-left)"
            />
            <rect x="165" y="52" width="7" height="3.5" rx="1.5" fill="#FFFFFF" opacity="0.95" />
            <rect x="165" y="70" width="7" height="3.5" rx="1.5" fill="#FFFFFF" opacity="0.95" />
            <rect x="165" y="88" width="7" height="3.5" rx="1.5" fill="#FFFFFF" opacity="0.95" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-black tracking-tight text-emerald-950 font-sans">Asset Log</h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          역량 정원에 오신 것을 환영합니다.<br />
          나만의 소중한 실무와 자소서 에셋들을 보호하고 가꾸세요.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-white border-b border-slate-100 sticky top-0 z-20">
        <button
          onClick={() => {
            setActiveTab("login");
            setErrorMsg(null);
          }}
          className={`flex-1 py-4 text-xs font-black tracking-wide text-center transition-all border-b-2 ${
            activeTab === "login"
              ? "border-emerald-600 text-emerald-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          🔑 로그인
        </button>
        <button
          onClick={() => {
            setActiveTab("register");
            setErrorMsg(null);
          }}
          className={`flex-1 py-4 text-xs font-black tracking-wide text-center transition-all border-b-2 ${
            activeTab === "register"
              ? "border-emerald-600 text-emerald-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          🌱 회원 가입
        </button>
      </div>

      <div className="flex-1 px-6 py-8">
        
        {/* Validation Messages */}
        {errorMsg && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 flex gap-3 text-red-900 animate-slideDown">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <span className="text-xs font-bold leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 flex gap-3 text-emerald-900 animate-slideDown">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-xs font-bold leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Existing Data Notice */}
        {hasOfflineData && (
          <div className="mb-6 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 flex gap-3 text-sky-900 shadow-sm">
            <Sparkles className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
            <div className="text-xs font-medium leading-normal">
              <span className="font-extrabold text-sky-950">💡 기존 비회원 데이터 발견: </span>
              기기 전용에 보관 중이던 <strong className="text-emerald-700"> {offlineName} </strong>님의 정원 데이터가 감지되었습니다. 새로 가입하시거나 로그인 시 현재 브라우저의 이력은 안전하게 동기화 연동됩니다!
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={activeTab === "login" ? handleLogin : handleRegister} className="space-y-4">
          <div id="auth-username-field">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">
              아이디 (ID)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="사용할 아이디 기입"
                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-5 py-3.5 text-xs font-bold outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div id="auth-password-field">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">
              비밀번호 (Password)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 기입(4자 이상)"
                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-5 py-3.5 text-xs font-bold outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {activeTab === "register" && (
            <div className="animate-fadeIn mt-4" id="auth-confirm-password-field">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">
                비밀번호 확인
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="동일한 비밀번호 재입력"
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-5 py-3.5 text-xs font-bold outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-650 to-emerald-500 text-sm font-black text-white py-4 shadow-lg hover:from-emerald-700 hover:to-emerald-600 transition-all active:scale-[0.98] cursor-pointer mt-6"
          >
            {activeTab === "login" ? "🔑 에셋 정원 로그인하기" : "🌱 신규 가입 및 온보딩 시작"}
          </button>
        </form>

        {/* Informative Hints footer */}
        <div className="mt-8 rounded-2xl bg-slate-100 p-4 border border-slate-150 text-[11px] text-slate-500 leading-relaxed">
          <h4 className="font-extrabold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>경험 자산의 무결성 보증 장치</span>
          </h4>
          ID와 비밀번호를 설정하여 브라우저에 여러 대상을 가꾸어 볼 수 있습니다. 가입 완료 시 새로운 유저는 <strong className="text-emerald-700">빈 가든 상태(시작 시 에셋 이력 0개)</strong>에서 신규 이정표 조건에 따라 나무를 안전하게 육성 수확해 갈 수 있으며, 기기 전용 이력을 즉시 연동하여 유지시킬 수 있습니다.
        </div>
      </div>
    </div>
  );
}
