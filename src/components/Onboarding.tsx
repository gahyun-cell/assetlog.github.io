import React, { useState } from "react";
import { UserCareerProfile } from "../types";

interface OnboardingProps {
  onComplete: (profile: UserCareerProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [situation, setSituation] = useState("");
  const [customSituation, setCustomSituation] = useState("");
  const [goal, setGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [seed, setSeed] = useState<"planning" | "analysis" | "creativity" | "execution" | "">("");

  const jobsList = [
    { title: "서비스 기획 / PM", emoji: "📋" },
    { title: "개발 / 엔지니어링", emoji: "⚙️" },
    { title: "데이터 분석", emoji: "📊" },
    { title: "UX/UI 디자인", emoji: "🎨" },
    { title: "콘텐츠 마케팅", emoji: "📣" },
    { title: "전략 기획 / 사업 개발", emoji: "💰" }
  ];

  const seeds = [
    { type: "planning" as const, name: "기획의 씨앗", emoji: "💡", desc: "아이디어가 구조적인 해결책으로 태동합니다." },
    { type: "analysis" as const, name: "분석의 씨앗", emoji: "🔍", desc: "데이터와 통찰력이 수치적인 눈을 키워줍니다." },
    { type: "creativity" as const, name: "창의의 씨앗", emoji: "🎨", desc: "고정관념을 무너뜨리는 감성을 일깨웁니다." },
    { type: "execution" as const, name: "실행의 씨앗", emoji: "⚡", desc: "빠른 행동과 도전정신으로 기여를 증명합니다." }
  ];

  const toggleJob = (jobTitle: string) => {
    if (selectedJobs.includes(jobTitle)) {
      setSelectedJobs(selectedJobs.filter(j => j !== jobTitle));
    } else {
      if (selectedJobs.length < 3) {
        setSelectedJobs([...selectedJobs, jobTitle]);
      }
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    const finalSituation = situation === "기타 (직접 입력)" ? customSituation.trim() : situation;
    const finalGoal = goal === "기타 (직접 입력)" ? customGoal.trim() : goal;

    if (!userName || !finalSituation || !finalGoal || selectedJobs.length === 0 || !seed) return;

    // Create a personalized initial profile matching choices
    const baseProfile: UserCareerProfile = {
      name: userName,
      situation: finalSituation,
      targetGoal: finalGoal,
      targetJobs: selectedJobs,
      seedType: seed,
      level: 1,
      exp: 0,
      totalPoints: 0,
      waterDroplets: 0,
      education: "",
      skillScores: {
        "기획력": 0,
        "데이터분석": 0,
        "커뮤니케이션": 0,
        "실행력": 0,
        "UX리서치": 0,
        "개발역량": 0,
        "논리력": 0,
        "설득력": 0
      }
    };
    onComplete(baseProfile);
  };

  const isNextDisabled = () => {
    if (step === 1) {
      if (!userName.trim() || !situation) return true;
      if (situation === "기타 (직접 입력)" && !customSituation.trim()) return true;
    }
    if (step === 2) {
      if (!goal) return true;
      if (goal === "기타 (직접 입력)" && !customGoal.trim()) return true;
    }
    if (step === 3 && selectedJobs.length === 0) return true;
    return false;
  };

  return (
    <div id="onboarding" className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col overflow-y-auto bg-slate-50 font-sans shadow-2xl">
      
      {/* ── HIGH PREMIUM HERO LOGO STYLING (Inspired by the Clean Green Logo Image) ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#f3fbf6] via-[#fbfcfa] to-[#ffffff] px-6 pt-10 pb-8 text-center border-b border-emerald-100/40">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-emerald-500/5 blur-3xl"></div>
        <div className="absolute -left-12 -bottom-10 h-32 w-32 rounded-full bg-emerald-300/10 blur-2xl"></div>
        
        {/* SVG Premium AL Logo */}
        <div className="relative mb-3 flex items-center justify-center">
          <svg viewBox="0 0 320 180" className="w-52 h-28 relative z-10 filter drop-shadow-sm transition-transform duration-500 hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="al-grad-left" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0B6B45" />
                <stop offset="60%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
              <linearGradient id="al-grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>

            {/* Left Ribbon / Leaf of 'A' */}
            <path 
              d="M 95 130 C 95 130 110 90 140 60 C 170 30 190 25 180 25 C 160 25 125 55 102 100 C 88 125 95 130 95 130 Z" 
              fill="url(#al-grad-left)" 
            />
            {/* Soft folding path representing crossbar fold of 'A' */}
            <path 
              d="M 102 100 C 115 112 138 116 165 111 C 178 109 174 100 160 102 C 132 106 115 104 102 100 Z" 
              fill="url(#al-grad-right)" 
              opacity="0.9"
            />
            
            {/* Right Leaf Ruler Stem of 'L' */}
            <path 
              d="M 183 25 C 183 25 170 30 170 43 L 170 115 C 170 135 178 138 215 138 C 228 138 235 132 228 132 C 210 132 188 134 184 118 L 184 25 Z" 
              fill="url(#al-grad-right)" 
            />
            {/* The lush diagonal Leaf structure of 'L' */}
            <path 
              d="M 183 85 C 190 76 222 35 226 38 C 230 42 206 95 184 113 Z" 
              fill="url(#al-grad-left)"
            />

            {/* Metric scales (Growth ticks) */}
            <rect x="165" y="52" width="7" height="3.5" rx="1.5" fill="#FFFFFF" opacity="0.95" />
            <rect x="165" y="70" width="7" height="3.5" rx="1.5" fill="#FFFFFF" opacity="0.95" />
            <rect x="165" y="88" width="7" height="3.5" rx="1.5" fill="#FFFFFF" opacity="0.95" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-black tracking-tight text-emerald-950 font-sans">Asset Log</h1>
        <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed max-w-[340px] mx-auto">
          흩어진 나의 소중한 경험 에셋들을 유니크하게 아카이빙하고,<br />
          아름다운 커리어 가든을 성장시켜 보관 증명하는 공간.
        </p>
      </div>

      {/* Stepper Wizard Body */}
      <div className="flex-1 px-6 py-8">
        {/* Step Indicator Bullets */}
        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-emerald-600"
                  : s < step
                  ? "w-2.5 bg-emerald-200 done"
                  : "w-2.5 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* STEP 1: Name and Current Situation */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-lg font-black text-slate-800 leading-tight">반갑습니다! 성함과 현재 소속을 선택해주세요.</h2>
            <p className="mt-1 text-xs text-slate-500 mb-6">나를 대표할 고유 필명이나 한국어 본명을 입력하세요.</p>
            
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">이름 또는 닉네임</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="예: 김지유"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
              />
            </div>

            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">현재 상태</label>
            <div className="grid gap-3">
              {[
                { title: "대학생 / 취업 준비생", icon: "🎓", desc: "졸업을 준비하며 첫 커리어를 향해 도약하는 기획가" },
                { title: "부트캠프 / 교육 수강생", icon: "💻", desc: "실무 기술 요소를 빠르게 습득 중인 주도론자" },
                { title: "1~3년차 신입/주니어 직장인", icon: "💼", desc: "실제 환경 성과를 발굴하며 이직을 준비하는 실천가" },
                { title: "기타 (직접 입력)", icon: "✨", desc: "나만의 고유한 상황이나 소속을 기술합니다." }
              ].map((item) => (
                <div
                  key={item.title}
                  onClick={() => setSituation(item.title)}
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                    situation === item.title
                      ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600 shadow-sm"
                      : "border-slate-150 bg-white hover:border-emerald-200 hover:bg-slate-50/40"
                  }`}
                >
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{item.title}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {situation === "기타 (직접 입력)" && (
              <div className="mt-4 animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">현재 상태 혹은 소속 직접 입력</label>
                <input
                  type="text"
                  value={customSituation}
                  onChange={(e) => setCustomSituation(e.target.value)}
                  placeholder="예: 프리랜서 디자이너, 예비 창업가 등"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Goal Type */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h2 className="text-lg font-black text-slate-800 leading-tight">나의 커리어 정원 목표는 무엇인가요?</h2>
            <p className="mt-1 text-xs text-slate-500 mb-6 font-medium">달성하고 싶은 핵심 이정표를 공유해 주세요.</p>

            <div className="grid gap-3">
              {[
                { title: "신입 서비스기획 포지션 입사", icon: "🎯", desc: "나의 에셋들을 조합해 완벽한 신입 자소서 설계" },
                { title: "성공적인 타 부서/다른 분야 이직", icon: "🚀", desc: "보유 경험 및 핵심 역량의 직무 갭 보완하기" },
                { title: "단단하고 세련된 포트폴리오 상시 아카이빙", icon: "📁", desc: "진행했던 중구난방 프로젝트들을 체계적으로 일치화" },
                { title: "개인 창작 / 사이드 프로젝트 / 역량 강화", icon: "⚡", desc: "스스로를 동기부여하고 부족한 약점을 극복하기" },
                { title: "기타 (직접 입력)", icon: "✨", desc: "나만의 특별한 커리어 도달 목표를 기술합니다." }
              ].map((item) => (
                <div
                  key={item.title}
                  onClick={() => setGoal(item.title)}
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                    goal === item.title
                      ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600 shadow-sm"
                      : "border-slate-150 bg-white hover:border-emerald-200 hover:bg-slate-50/40"
                  }`}
                >
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{item.title}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {goal === "기타 (직접 입력)" && (
              <div className="mt-4 animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">희망 목표 직접 입력</label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="예: 1인 창업 런칭, 훌륭한 테크 리더 성장 등"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Job Selection */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <h2 className="text-lg font-black text-slate-800 leading-tight">어떤 직무를 겨냥하고 있나요?</h2>
            <p className="mt-1 text-xs text-slate-500 mb-6 font-medium font-sans">최대 3개까지 복수 선택해 보세요. (AI 정량 매칭 기준 탑재)</p>

            <div className="grid grid-cols-2 gap-3">
              {jobsList.map((job) => {
                const isSelected = selectedJobs.includes(job.title);
                return (
                  <div
                    key={job.title}
                    onClick={() => toggleJob(job.title)}
                    className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-5 text-center transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/30 font-bold text-emerald-800 ring-1 ring-emerald-600 shadow-sm"
                        : "border-slate-150 bg-white text-slate-600 hover:border-emerald-250 hover:bg-slate-50/40"
                    }`}
                  >
                    <span className="text-3xl mb-2 select-none">{job.emoji}</span>
                    <span className="text-xs font-bold">{job.title}</span>
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 text-[10px] bg-emerald-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-black">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Choose Tree Seed */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <h2 className="text-lg font-black text-slate-800 leading-tight">🌱 어떤 씨앗으로 정원을 가꾸시겠습니까?</h2>
            <p className="mt-1 text-xs text-slate-500 mb-6 font-medium">선택한 씨앗 유형에 따라 커리어 정원에서 자라는 랜드마크 나무가 바뀝니다!</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {seeds.map((s) => (
                <div
                  key={s.type}
                  onClick={() => setSeed(s.type)}
                  className={`relative cursor-pointer rounded-2xl border p-4 text-center transition-all ${
                    seed === s.type
                      ? "border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600 shadow-sm"
                      : "border-slate-150 bg-white hover:border-emerald-250 hover:bg-slate-50/40"
                  }`}
                >
                  <span className="text-4xl block mb-2 select-none">{s.emoji}</span>
                  <span className="text-xs font-black text-slate-800">{s.name}</span>
                  <p className="mt-1 text-[9px] text-slate-450 leading-tight font-medium">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4 flex gap-3">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            ← 이전
          </button>
        )}
        <button
          onClick={step === 4 ? handleFinish : handleNext}
          disabled={step === 4 ? !seed : isNextDisabled()}
          className={`w-full rounded-2xl py-3.5 text-center text-sm font-bold text-white shadow-md transition-all ${
            step === 4 && !seed
              ? "bg-slate-300"
              : step < 4 && isNextDisabled()
              ? "bg-slate-300"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 cursor-pointer shadow-emerald-200 shadow-lg"
          } ${step > 1 ? "flex-[2]" : ""}`}
        >
          {step === 4 ? "🌿 나의 에셋 정원 입장하기" : "다음 단계 →"}
        </button>
      </div>
    </div>
  );
}
