import React from "react";
import { motion } from "motion/react";

interface CareerTreeProps {
  level: number;
  exp: number; // 0..100
  seedType: "planning" | "analysis" | "creativity" | "execution" | string;
  skillScores?: Record<string, number>;
}

export const CareerTreeVisual: React.FC<CareerTreeProps> = ({
  level,
  exp,
  seedType,
  skillScores = {}
}) => {
  // Determine color scheme based on seedType
  const getThemeColors = () => {
    switch (seedType) {
      case "planning":
        return {
          trunk: "#7c2d12", // Warm Wood
          primaryLeaf: "#10b981", // Emerald
          secondaryLeaf: "#34d399", // Mint
          accentLeaf: "#059669", // Dark Emerald
          glowColor: "rgba(16, 185, 129, 0.4)",
          fruitColor: "#facc15", // Golden Pear
          bgGradient: "from-emerald-50/50 to-teal-50/50",
          desc: "마일스톤을 실현하는 체계적인 기획의 나무",
          accentEmoji: "🌿"
        };
      case "analysis":
        return {
          trunk: "#1e293b", // Slate Dark
          primaryLeaf: "#4f46e5", // Indigo
          secondaryLeaf: "#6366f1", // Light Indigo
          accentLeaf: "#3b82f6", // Blue
          glowColor: "rgba(79, 70, 229, 0.4)",
          fruitColor: "#22d3ee", // Cyan Diamond Fruit
          bgGradient: "from-indigo-50/50 to-blue-50/50",
          desc: "정량 데이터 기반으로 입증된 정밀한 연구의 나무",
          accentEmoji: "📊"
        };
      case "creativity":
        return {
          trunk: "#4c0519", // Deep Rose Wood
          primaryLeaf: "#db2777", // Pink
          secondaryLeaf: "#f472b6", // Pastel Pink
          accentLeaf: "#8b5cf6", // Purple
          glowColor: "rgba(219, 39, 119, 0.4)",
          fruitColor: "#fb923c", // Creative Orange
          bgGradient: "from-pink-50/50 to-purple-50/50",
          desc: "아이디어와 스토리 메이킹으로 세상을 흔드는 예술의 나무",
          accentEmoji: "🌸"
        };
      case "execution":
      default:
        return {
          trunk: "#451a03", // Deep Brown
          primaryLeaf: "#15803d", // Deep Green
          secondaryLeaf: "#22c55e", // Light Green
          accentLeaf: "#a3e635", // Lime Green
          glowColor: "rgba(34, 197, 94, 0.4)",
          fruitColor: "#ea580c", // Red-orange Fruit
          bgGradient: "from-green-50/50 to-lime-50/50",
          desc: "지체없이 실천하여 열매를 맺는 기강의 실행 나무",
          accentEmoji: "🌳"
        };
    }
  };

  const theme = getThemeColors();

  // Combine level and exp to a fluid progress (e.g. 1.0 up to 4.0+)
  const progress = level + exp / 100;
  
  // Growth scale multipliers
  const scale = Math.min(1.5, 0.75 + progress * 0.18);
  const foliageOpacity = Math.min(1, 0.4 + level * 0.15);

  // Determine top 2 skills to show as fruits next to branches
  const sortedSkills = Object.entries(skillScores)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 2);

  // Simple wind sway angles for twigs/leaves
  const swayVariants = {
    sway: {
      rotate: [-1.5, 1.5, -1.5],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`relative w-full rounded-2xl bg-gradient-to-br ${theme.bgGradient} border border-slate-100 p-5 sm:p-7 flex flex-col items-center gap-6 overflow-hidden shadow-sm`}>
      {/* Visual Canvas Area */}
      <div className="relative w-full max-w-[320px] h-[230px] bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100/70 flex items-center justify-center p-3 shrink-0 shadow-inner">
        
        {/* Level Indicator Badge Over the Tree */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/95 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md z-10">
          <span className="text-xs">{theme.accentEmoji}</span>
          <span>Lv.{level}</span>
          <span className="text-slate-400">({exp}%)</span>
        </div>

        {/* Ambient Glow behind the tree crown */}
        <div 
          className="absolute rounded-full filter blur-[32px] pointer-events-none transition-all duration-1000"
          style={{
            width: `${50 + level * 35}px`,
            height: `${50 + level * 35}px`,
            transform: "translateY(-20px)",
            backgroundColor: theme.glowColor,
            opacity: 0.2 + (exp / 200)
          }}
        />

        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 210"
          className="w-full h-full select-none"
        >
          {/* Ground soil block */}
          <ellipse cx="100" cy="190" rx="65" ry="12" fill="#cbd5e1" opacity="0.4" />
          <ellipse cx="100" cy="190" rx="45" ry="8" fill="#94a3b8" opacity="0.6" />
          <ellipse cx="100" cy="189" rx="20" ry="4" fill={theme.trunk} opacity="0.15" />

          {/* Grass strands around trunk bottom */}
          <path d="M 85 190 L 83 183 L 88 190 Z" fill={theme.primaryLeaf} opacity="0.8" />
          <path d="M 115 190 L 117 184 L 112 189 Z" fill={theme.accentLeaf} opacity="0.8" />
          <path d="M 102 190 L 100 181 L 105 190 Z" fill={theme.secondaryLeaf} />

          {/* MAIN TREE ROOT & TRUNK GROUP */}
          <g>
            {/* Main Trunk */}
            {/* Grows thicker and taller with level */}
            <motion.path
              d={`M92,190 C93,160 95,${140 - level * 10} 100,${120 - level * 12} C105,${140 - level * 10} 107,160 108,190 Z`}
              fill={theme.trunk}
              initial={{ scaleY: 0.3 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ transformOrigin: "bottom center" }}
            />

            {/* Left Primary Branch */}
            {level >= 2 && (
              <motion.path
                d={`M98,${155 - level * 4} Q80,${140 - level * 5} 70,${120 - level * 8}`}
                stroke={theme.trunk}
                strokeWidth={Math.min(6, 2 + level * 0.8)}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
              />
            )}

            {/* Right Primary Branch */}
            {level >= 2 && (
              <motion.path
                d={`M102,${152 - level * 4} Q120,${135 - level * 5} 128,${115 - level * 8}`}
                stroke={theme.trunk}
                strokeWidth={Math.min(5, 1.8 + level * 0.7)}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.4 }}
              />
            )}

            {/* Sub twigs details for Higher Levels */}
            {level >= 3 && (
              <>
                {/* Left side twig */}
                <motion.path
                  d={`M73,125 Q62,122 58,110`}
                  stroke={theme.trunk}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
                {/* Middle split branch */}
                <motion.path
                  d={`M100,${118 - level * 10} Q92,${95 - level * 5} 90,${80 - level * 8}`}
                  stroke={theme.trunk}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                />
              </>
            )}

            {/* FOLIAGE CLOUDS / LEAF BUBBLES - Animated beautifully */}
            <motion.g
              variants={swayVariants}
              animate="sway"
              className="origin-bottom"
              style={{ transformOrigin: "100px 150px" }}
            >
              {/* LEVEL 1: Small sprout foliage at top */}
              {level === 1 && (
                <g opacity={foliageOpacity}>
                  <motion.circle
                    cx="100"
                    cy={115 - level * 8}
                    r={18 * scale}
                    fill={theme.primaryLeaf}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 80 }}
                  />
                  <motion.circle
                    cx="90"
                    cy={110 - level * 8}
                    r={13 * scale}
                    fill={theme.secondaryLeaf}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
                  />
                  <motion.circle
                    cx="108"
                    cy={112 - level * 8}
                    r={12 * scale}
                    fill={theme.accentLeaf}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 80, delay: 0.2 }}
                  />
                </g>
              )}

              {/* LEVEL 2: Expanded crown */}
              {level === 2 && (
                <g opacity={foliageOpacity}>
                  {/* Left crown */}
                  <motion.circle cx="70" cy="118" r="22" fill={theme.secondaryLeaf} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} />
                  <motion.circle cx="60" cy="108" r="16" fill={theme.accentLeaf} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }} />
                  {/* Right crown */}
                  <motion.circle cx="128" cy="112" r="21" fill={theme.primaryLeaf} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} />
                  <motion.circle cx="135" cy="103" r="15" fill={theme.secondaryLeaf} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.15 }} />
                  {/* Top crown */}
                  <motion.circle cx="100" cy="98" r="25" fill={theme.primaryLeaf} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} />
                </g>
              )}

              {/* LEVEL 3: Flourishing Rich Crown */}
              {level === 3 && (
                <g opacity={foliageOpacity}>
                  {/* Left foliage */}
                  <circle cx="68" cy="115" r="26" fill={theme.accentLeaf} />
                  <circle cx="54" cy="102" r="20" fill={theme.secondaryLeaf} />
                  {/* Right foliage */}
                  <circle cx="130" cy="108" r="25" fill={theme.primaryLeaf} />
                  <circle cx="140" cy="98" r="18" fill={theme.secondaryLeaf} />
                  {/* Core middle foliage */}
                  <circle cx="98" cy="88" r="30" fill={theme.primaryLeaf} />
                  <circle cx="85" cy="74" r="22" fill={theme.secondaryLeaf} />
                  <circle cx="112" cy="76" r="22" fill={theme.accentLeaf} />
                  
                  {/* Sparkling light specs */}
                  <circle cx="95" cy="72" r="2.5" fill="#ffffff" className="animate-pulse" />
                  <circle cx="120" cy="92" r="2" fill="#ffffff" className="animate-pulse" />
                  <circle cx="65" cy="100" r="2" fill="#ffffff" className="animate-pulse" />
                </g>
              )}

              {/* LEVEL 4+: Ultimate Majestic Mega Tree with flowers & stars */}
              {level >= 4 && (
                <g opacity={foliageOpacity}>
                  {/* Mega overlapping canopies */}
                  <circle cx="65" cy="110" r="28" fill={theme.accentLeaf} />
                  <circle cx="52" cy="95" r="24" fill={theme.secondaryLeaf} />
                  <circle cx="42" cy="85" r="18" fill={theme.primaryLeaf} opacity="0.9" />

                  <circle cx="135" cy="104" r="28" fill={theme.primaryLeaf} />
                  <circle cx="145" cy="90" r="22" fill={theme.secondaryLeaf} />
                  <circle cx="155" cy="80" r="17" fill={theme.accentLeaf} opacity="0.9" />

                  <circle cx="100" cy="82" r="34" fill={theme.primaryLeaf} />
                  <circle cx="80" cy="64" r="28" fill={theme.secondaryLeaf} />
                  <circle cx="120" cy="66" r="28" fill={theme.accentLeaf} />
                  <circle cx="100" cy="50" r="24" fill={theme.primaryLeaf} />

                  {/* Super visual stars and glowing particles on level 4+ */}
                  {[
                    { cx: 75, cy: 55, r: 3 },
                    { cx: 125, cy: 50, r: 2.5 },
                    { cx: 100, cy: 40, r: 3 },
                    { cx: 58, cy: 80, r: 2.5 },
                    { cx: 142, cy: 75, r: 3 }
                  ].map((star, i) => (
                    <motion.polygon
                      key={i}
                      points={`${star.cx},${star.cy - 4} ${star.cx + 1},${star.cy - 1} ${star.cx + 4},${star.cy} ${star.cx + 1},${star.cy + 1} ${star.cx},${star.cy + 4} ${star.cx - 1},${star.cy + 1} ${star.cx - 4},${star.cy} ${star.cx - 1},${star.cy - 1}`}
                      fill="#fffdec"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ))}
                </g>
              )}

              {/* DYNAMIC SKILL FRUITS (Grows next to branch endpoints on Level 2+) */}
              {level >= 2 && sortedSkills.map(([skillName, score], idx) => {
                // Pin fruits at distinct location depending on left or right branch
                const xPos = idx === 0 ? 68 : 130;
                const yPos = idx === 0 ? 115 : 102;
                
                return (
                  <motion.g
                    key={skillName}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.5 + idx * 0.2 }}
                  >
                    {/* Hanging stem */}
                    <line x1={xPos} y1={yPos} x2={xPos} y2={yPos + 8} stroke={theme.trunk} strokeWidth="1.5" />
                    {/* Fruit sphere */}
                    <circle
                      cx={xPos}
                      cy={yPos + 8}
                      r={Math.max(5, Math.min(9, (score as number) / 8))}
                      fill={theme.fruitColor}
                      className="shadow-sm filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)] cursor-help"
                    />
                    {/* Tiny leaf on fruit */}
                    <path d={`M ${xPos} ${yPos+4} Q ${xPos+3} ${yPos+2} ${xPos+4} ${yPos+5}`} stroke={theme.secondaryLeaf} strokeWidth="1" fill="none" />
                    
                    {/* Label */}
                    <rect
                      x={xPos - 22}
                      y={yPos + 18}
                      width="44"
                      height="12"
                      rx="4"
                      fill="#1e293b"
                      opacity="0.85"
                    />
                    <text
                      x={xPos}
                      y={yPos + 27}
                      fontSize="7"
                      fontWeight="black"
                      fill="#ffffff"
                      textAnchor="middle"
                    >
                      {skillName}
                    </text>
                  </motion.g>
                );
              })}
            </motion.g>
          </g>
        </svg>
      </div>

      {/* Dynamic Textual details of the Career Garden */}
      <div className="flex-1 w-full space-y-4 text-center text-slate-800">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[10px] font-black tracking-widest text-[#245e3d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase shadow-sm">
            나무 종자: {seedType === "planning" ? "전략과 기획" : seedType === "analysis" ? "정밀분석" : seedType === "creativity" ? "창의융합" : "실행과 기강"}
          </span>
          <span className="text-xs text-rose-600 font-extrabold bg-rose-50 px-3 py-1 rounded-full border border-rose-100 flex items-center gap-1 shadow-sm">
            <span>🌳</span>
            <span>Lv.{level}</span>
          </span>
        </div>
        
        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">{theme.desc}</h3>
        <p className="text-[12px] sm:text-[13px] leading-relaxed text-slate-600 max-w-2xl mx-auto font-normal">
          이 구역의 특별한 나무는 회원의 진취적이고 다채로운 커리어 스토리텔링 이력을 영양소 삼아 가꿔진 생태계입니다. 
          취업 가치를 증명하는 다양한 연쇄 액션들로 에셋을 물들여 나무를 더욱 기품 지게 확장시켜 보세요!
        </p>

        {/* Action Milestones indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200/50">
          <div className="bg-white/90 p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <span className="text-xl shrink-0 bg-emerald-50 w-9 h-9 rounded-full flex items-center justify-center text-center">🌱</span>
            <div className="text-left">
              <p className="text-[9px] text-slate-400 font-black leading-none uppercase tracking-widest">LEVEL 2 성장 조건</p>
              <p className="text-[11.5px] font-extrabold text-slate-800 mt-1 leading-tight">에셋 1개 이상 + 프로필 정보 작성</p>
            </div>
          </div>
          <div className="bg-white/90 p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <span className="text-xl shrink-0 bg-rose-50 w-9 h-9 rounded-full flex items-center justify-center text-center">🍎</span>
            <div className="text-left">
              <p className="text-[9px] text-slate-400 font-black leading-none uppercase tracking-widest">LEVEL 3+ 개화 조건</p>
              <p className="text-[11.5px] font-extrabold text-slate-800 mt-1 leading-tight">자소서 & 포트폴리오 빌딩 완료</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
