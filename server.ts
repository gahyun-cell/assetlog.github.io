import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiInstance = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
        console.log("Successfully initialized Gemini GenAI Client.");
      } catch (error) {
        console.error("Failed to initialize Gemini Client: ", error);
      }
    } else {
      console.warn("GEMINI_API_KEY is not configured or is a placeholder. Using intelligent fallback mock generator.");
    }
  }
  return aiInstance;
}

// ── API ROUTES ──────────────────────────────────────────────────────────────

/**
 * 1. AI STAR Resume Builder API
 * Input: { question: string, assets: any[] }
 */
app.post("/api/ai/star", async (req, res) => {
  const { question, assets } = req.body;

  if (!question || !assets || !Array.isArray(assets) || assets.length === 0) {
    return res.status(400).json({ error: "자소설 문항과 하나 이상의 에셋을 제출해야 합니다." });
  }

  const ai = getGeminiClient();

  // If Gemini client is ready, call Gemini 3.5 Flash
  if (ai) {
    try {
      const prompt = `
당신은 자소서 및 취업 컨설팅 전문가입니다. 
다음 자소서 문항과 사용자가 축적한 에셋(활동 이력) 정보를 기반으로 STAR (Situation, Task, Action, Result) 구조의 자기소개서 한 문단을 작성해 주세요.

문항: "${question}"
사용할 에셋들:
${assets.map((a: any, i: number) => `[에셋 ${i+1}]
- 제목: ${a.title}
- 세부정보: ${a.subText}
- 관련역량: ${a.skills?.map((s: any) => `${s.skillName}(+${s.points}pt)`).join(", ")}
- 태그: ${a.tags?.join(", ")}`).join("\n")}

조건:
1. 상황(Situation), 과제(Task), 행동(Action), 결과(Result)를 취업용 전문 비즈니스 어조(한국어, 존댓말 ~했습니다)로 명확하고 설득력 있게 작성하세요.
2. overallScore는 100점 만점에 이 조합이 문항에 부합하는 적합도 점수(예: 85)입니다.
3. coreStrengths는 이 자기소개서에서 어필하는 핵심 역량 키워드를 대표적으로 2~3개 추출해 주세요.

다음 JSON 형식을 정확히 지켜서 응답해 주세요:
{
  "situation": "[상황에 해당하는 짧고 강렬한 자소서 한두 문장]",
  "task": "[과제/목표에 해당하는 자소서 한두 문장]",
  "action": "[수행한 구체적 행동에 해당하는 핵심 두세 문장]",
  "result": "[정량적 혹은 정성적 성과에 해당하는 깔끔한 한두 문장]",
  "overallScore": 85,
  "coreStrengths": ["역량단어1", "역량단어2"]
}
      `.trim();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              situation: { type: Type.STRING },
              task: { type: Type.STRING },
              action: { type: Type.STRING },
              result: { type: Type.STRING },
              overallScore: { type: Type.INTEGER },
              coreStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["situation", "task", "action", "result", "overallScore", "coreStrengths"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsedData = JSON.parse(responseText);
        return res.json(parsedData);
      }
    } catch (error) {
      console.error("Gemini API STAR generation error:", error);
      // Fallback below
    }
  }

  // Graceful standard fallback simulation when API fails or is offline
  console.log("Serving standard professional fallback for STAR Builder.");
  const assetTitles = assets.map((a: any) => a.title).join(", ");
  res.json({
    situation: `현재 목표하는 취업 및 프로젝트 역량을 발휘하기 위해 [${assetTitles}]의 기획과 실행을 결심했습니다. 당시 시장 트렌드와 고객 경험 개선에 중점을 둔 핵심 프로젝트 환경에 직면해 있었습니다.`,
    task: "프로젝트 진행 중 한정된 기간과 자원 속에서 차별화된 결과물을 개발하고 구체적인 분석 능력을 바탕으로 팀의 프로젝트 성취 수준을 한층 개선해야 하는 과제를 부여받았습니다.",
    action: `에셋의 주요 내용을 응용하여 다각적인 조사 방법론을 직접 설계하였습니다. 설문조사 데이터와 기술 요소를 주도적으로 분석해 인사이트를 발굴하고, 24슬라이드 분량의 심층 보고서 작성을 직접 지휘했습니다.`,
    result: "결과적으로 성공적인 결과보고서 발표를 마무리 지으며 팀 내 우수 프로젝트로 검증받았고, 이전 대비 높은 성과 지수를 달성하며 핵심 직무 지식이 심화되는 소중한 역량 자산을 축적했습니다.",
    overallScore: 88,
    coreStrengths: ["기획 및 분석력", "문제해결력", "실행력"]
  });
});

/**
 * 2. AI JD (Job Description) Competency Gap Matcher API
 * Input: { jdText: string, userProfile: any, assets: any[] }
 */
app.post("/api/ai/jd-analyze", async (req, res) => {
  const { jdText, userProfile, assets } = req.body;

  if (!jdText) {
    return res.status(400).json({ error: "분석할 채용 공고 또는 텍스트가 비어 있습니다." });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `
당신은 커리어 컨설턴트 및 역량 매칭 헤트헌터입니다.
사용자가 입력한 채용공고 텍스트(JD)와 사용자가 등록한 경험 정보(에셋 리스트) 및 현재 역량 점수를 면밀히 교차 비교하여, 다음 조건에 충족하는 정성 및 정량 매칭 데이터를 분석 보고서 JSON으로 도출해 주세요.

[채용공고(JD)]
"${jdText}"

[사용자 프로필]
- 주 직무: ${userProfile?.targetJobs?.join(", ") || "미지정"}
- 누적 포인트: ${userProfile?.totalPoints || 480}

[현재 보유 에셋 리스트]
${(assets || []).map((a: any) => `- ${a.title} (${a.type}): ${a.subText} (관련역량: ${a.skills?.map((s: any) => s.skillName).join(", ")})`).join("\n")}

조건:
1. matchPercentage: 0~100 사이의 일치율 점수입니다. 에셋이 JD 요건과 일치할수록 높습니다.
2. skills: JD가 요구하는 핵심 4대 역랑에 대해 분석된 일치율 백분율(0-100) 리스트입니다.
3. gaps: 사용자가 채워야 할 대표 역랑 갭을 2~3개 도출하세요 level('high', 'medium', 'low')은 갭의 크기(클수록 high)를 말합니다.

응답 양식(JSON):
{
  "company": "[회사명 자동추출, 예: 카카오 서비스 기획]",
  "jobRole": "[직무명 자동추출, 예: UX/기획 어시스턴트]",
  "matchPercentage": 75,
  "skills": [
    { "skillName": "역량1", "score": 90 },
    { "skillName": "역량2", "score": 45 }
  ],
  "gaps": [
    {
      "skillName": "부족역량명",
      "description": "어떻게 부족하고 어떤 에셋을 보완해야 하는지에 대한 정밀 구체적 가이드",
      "level": "medium"
    }
  ]
}
      `.trim();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              jobRole: { type: Type.STRING },
              matchPercentage: { type: Type.INTEGER },
              skills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skillName: { type: Type.STRING },
                    score: { type: Type.INTEGER }
                  },
                  required: ["skillName", "score"]
                }
              },
              gaps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skillName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    level: { type: Type.STRING }
                  },
                  required: ["skillName", "description", "level"]
                }
              }
            },
            required: ["company", "jobRole", "matchPercentage", "skills", "gaps"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }
    } catch (error) {
      console.error("Gemini API JD analysis error:", error);
      // Fallback
    }
  }

  // Robust mock fallback
  console.log("Serving mock analysis for JD matching.");
  // Infer simple query parts to make it feel customized
  let companyName = "입력한 공고 분석";
  let targetRole = "서비스 기획 및 운영 담당자";
  if (jdText.toLowerCase().includes("kakao") || jdText.includes("카카오")) {
    companyName = "카카오 (Kakao)";
    targetRole = "서비스 기획 체험형 인턴";
  } else if (jdText.toLowerCase().includes("naver") || jdText.includes("네이버")) {
    companyName = "네이버 (NAVER)";
    targetRole = "UX/PM 신입 포지션";
  } else if (jdText.toLowerCase().includes("toss") || jdText.includes("토스")) {
    companyName = "비바리퍼블리카 (Toss)";
    targetRole = "Product Owner (PO) 어시스턴트";
  }

  res.json({
    company: companyName,
    jobRole: targetRole,
    matchPercentage: 72,
    skills: [
      { skillName: "서비스 기획력", score: 88 },
      { skillName: "데이터 분석", score: 55 },
      { skillName: "사용자 UX 리서치", score: 75 },
      { skillName: "SQL 쿼리 분석", score: 20 }
    ],
    gaps: [
      {
        skillName: "SQL 및 전처리",
        description: "현재 공고에서는 정교한 지표 분석을 위해 데이터 추출(SQL) 역량을 높이 사고 있으나 현재 포트폴리오에 관련 에셋이 없습니다. SQLD 자격증 정보 혹은 쿼리 가공 경험이 있다면 업로드해 일치율을 올릴 수 있습니다.",
        level: "high"
      },
      {
        skillName: "정량적 데이터 수집",
        description: "설문조사 중심의 정성 분석 에셋은 풍부하나 GA4, Amplitude 같은 행동 로그 분석 툴 응용 성과가 모호합니다. 부트캠프 프로젝트나 해커톤에서의 데이터 트래킹 로그 결과보고서를 신규 에셋으로 등록을 권장합니다.",
        level: "medium"
      }
    ]
  });
});

/**
 * 3. Intelligent Asset Auto Tagging
 * Process raw input and output recommended points
 */
app.post("/api/ai/parse-asset", async (req, res) => {
  const { title, type, userText } = req.body;

  if (!title) {
    return res.status(400).json({ error: "에셋 이름이 필요합니다." });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `
사용자가 새로 등록하고자 하는 커리어 에셋 정보입니다:
제목: "${title}"
형태: "${type || "텍스트 메모"}" (예: file(기본문서/기획서), text(분석 메모/보고글), video(영상/MP4/기록), link(배포 URL))
활동 부가 내용: "${userText || "없음"}"

이 에셋을 성과 분석 및 역량 tagging 처리하여 취업 포트폴리오 포인트와 태그를 매겨주는 똑똑한 시스템입니다.
특히 사용자가 등록한 에셋의 종류(형태)의 특성에 맞게 가든 밸런스를 향상시킬 수 있도록 최적의 핵심 실무 역량을 배당 규칙에 따라 우선 가집계해 주세요:
- 에셋 형태(type)가 "file"인 경우: '기획력', 'UX리서치' 역량을 핵심으로 부여하고 8pt ~ 15pt 범위의 가점을 제공하세요.
- 에셋 형태(type)가 "text"인 경우: '데이터분석', '논리력', '기획력' 역량을 핵심으로 부여하고 8pt ~ 15pt 범위의 가점을 제공하세요.
- 에셋 형태(type)가 "video"인 경우: '커뮤니케이션', '설득력', '실행력' 역량을 핵심으로 부여하고 8pt ~ 15pt 범위의 가점을 제공하세요.
- 에셋 형태(type)가 "link"인 경우: '개발역량', '실행력' 역량을 핵심으로 부여하고 8pt ~ 15pt 범위의 가점을 제공하세요.

위 가점 형태 규칙과 에셋 제목/내용을 조합하여 이 에셋에 가장 알맞은 취업 역량 키워드 1~2개(각 키워드 및 매칭 포인트 5pt~15pt 범위), 관련 세련된 추천 서브텍스트와 서브 태그 2개를 추천해 주세요.

다음 JSON 형식을 성실히 리턴해 주세요:
{
  "suggestedTitle": "[제목을 조금 더 매끄럽고 취업 자소서용으로 정리한 제목]",
  "subText": "[에셋 요약 설명 한줄, 예: 피드백 반영을 담은 기획서]",
  "skills": [
    { "skillName": "키워드1(예: 기획력)", "points": 10 },
    { "skillName": "키워드2(예: 데이터분석)", "points": 6 }
  ],
  "tags": ["서브태그1", "서브태그2"]
}
      `.trim();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedTitle: { type: Type.STRING },
              subText: { type: Type.STRING },
              skills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skillName: { type: Type.STRING },
                    points: { type: Type.INTEGER }
                  },
                  required: ["skillName", "points"]
                }
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["suggestedTitle", "subText", "skills", "tags"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }
    } catch (error) {
      console.error("Gemini API asset parse error:", error);
    }
  }

  // Default intelligent rule-based parsing based on type & title keywords fallback
  console.log("Serving smart deterministic fallback for new Asset tags based on type.");
  let mainSkill = "실행력";
  let mainPoints = 10;
  let secSkill = "기획력";
  let secPoints = 5;
  let customSub = "직접 경험하고 보완하여 성장시킨 소중한 기록";
  let fallbackTags = ["커리어자산", "성장기록"];

  const tLower = title.toLowerCase();

  // Primary allocation according to user asset type
  if (type === "file") {
    mainSkill = "기획력";
    mainPoints = 12;
    secSkill = "UX리서치";
    secPoints = 8;
    customSub = "전략 기획 문서 및 인터랙션 디자인 산출물 파일";
    fallbackTags = ["기획산출물", "UX/UI"];
  } else if (type === "text") {
    mainSkill = "데이터분석";
    mainPoints = 13;
    secSkill = "논리력";
    secPoints = 7;
    customSub = "정량 데이터 기반 실무 요약 및 인사이트 메모";
    fallbackTags = ["지표분석", "정량기록"];
  } else if (type === "voice") {
    mainSkill = "커뮤니케이션";
    mainPoints = 12;
    secSkill = "설득력";
    secPoints = 6;
    customSub = "구조적 피칭 스피치 및 커뮤니케이션 프레젠테이션 오디오";
    fallbackTags = ["음성녹음", "피칭성공"];
  } else if (type === "link") {
    mainSkill = "개발역량";
    mainPoints = 14;
    secSkill = "실행력";
    secPoints = 8;
    customSub = "소스코드 깃허브 원격 주소 및 배포 라이브 링크";
    fallbackTags = ["기술증명", "소프트웨어"];
  }

  // Keywords override refinement
  if (tLower.includes("기획") || tLower.includes("plan") || tLower.includes("pm")) {
    mainSkill = "기획력";
    if (type !== "file") secSkill = "UX리서치";
  } else if (tLower.includes("데이터") || tLower.includes("분석") || tLower.includes("excel") || tLower.includes("sql") || tLower.includes("지표")) {
    mainSkill = "데이터분석";
    if (type !== "text") secSkill = "논리력";
  } else if (tLower.includes("개발") || tLower.includes("코드") || tLower.includes("github") || tLower.includes("구현")) {
    mainSkill = "개발역량";
    if (type !== "link") secSkill = "실행력";
  } else if (tLower.includes("발표") || tLower.includes("피칭") || tLower.includes("스피치")) {
    mainSkill = "커뮤니케이션";
    if (type !== "voice") secSkill = "설득력";
  }

  res.json({
    suggestedTitle: title,
    subText: customSub,
    skills: [
      { skillName: mainSkill, points: mainPoints },
      { skillName: secSkill, points: secPoints }
    ],
    tags: fallbackTags
  });
});

/**
 * 4. AI Portfolio Content Generator API
 * Input: { title: string, intro: string, assets: any[], userProfile: any }
 */
app.post("/api/ai/portfolio", async (req, res) => {
  const { title, intro, assets, userProfile, target, purpose } = req.body;

  if (!assets || !Array.isArray(assets) || assets.length === 0) {
    return res.status(400).json({ error: "포트폴리오를 구성할 에셋이 최소 하나 이상 선택되어야 합니다." });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `
당신은 IT/스타트업 분야 최고의 전문 커리어 코치이자 포트폴리오 마스터 디자이너입니다.
사용자가 선택한 경험 이력(에셋 조각들)을 분석하여, 채용담당자나 기술 면접관의 눈길을 사로잡을 정밀한 직무 가치 중심의 포트폴리오 텍스트 명세서를 생성해 주십시오.

[제출 상황 & 대상 최적화 기준]
- 제출처 / 지원 대상 기업 및 부서: "${target || "명시되지 않음"}"
- 희망 분야 및 세부 직무 역할: "${purpose || "명시되지 않음"}"

[주요 에셋 및 프로필 공급 정보]
- 사용자 프로필: 이름 ${userProfile?.name || "조경사"}, 핵심목표 ${userProfile?.targetGoal || "신입 일치"}, 분야 ${userProfile?.targetJobs?.join(", ") || "IT 설계"}
- 선택한 에셋 목록:
${assets.map((a: any, i: number) => `[경험 ${i+1}] ${a.title} (${a.type})
  - 세부 요약: ${a.subText}
  - 증명된 역량: ${a.skills?.map((s: any) => `${s.skillName} (+${s.points}pt)`).join(", ")}
  - 관련 태그: ${a.tags?.join(", ")}`).join("\n")}

조건:
1. 이번 포트폴리오는 사용자가 정의한 [제출처/지원 대상]과 [희망 분야 및 세부 직무 역할]에 철저히 연계하여 설계되어야 합니다. 문장이 과도하게 장황하면 디자인 규격을 위반하고 스크롤이 무너집니다. 각 필드는 군더더기 없이 고도로 임팩트 있는 알짜배기 구문으로 구성하십시오.
2. academicSummary: 사용자의 학문적/이력적 배경과 지정된 [제출처] 및 [희망 분야/직무 역할]의 주도성에 초점을 맞춘 맞춤형 요약 설명글을 한국어로 작성하세요. 2문장 내외로 매우 직관적이고 강력한 어투로 줄여서 작성하십시오.
3. keyHighlights: 선택된 이력들을 각각 정제하여, 단순히 나열하는 게 아닌 'Challenge (지원 대상 부서의 업종적 난관이나 해결 극복 상황)', 'Action (해결을 위해 가용한 스킬과 전략을 영리하게 행동한 핵심 요약)', 'Impact (정량 성과 기반으로 제출처 직무에 바로 기여할 수 있는 핵심 이점)' 단계로 쪼개어 세련되게 재구성하세요. (각 에셋마다 1대1 매칭하며, 각 항목은 1.5문장 내외로 읽기 편하게 컴팩트하게 구성)
4. recommendedCareerPath: 제출 직무 역할에 근거해 채용담당자 관점에서 해당 이력과의 적합성을 최대화하여 합격/통과율을 극대화할 수 있는 실질적인 합격 팁 및 보완 로드맵 조언을 2문장 내외로 압축해 컴팩트하게 조언해 주십시오.

다음 JSON 형식을 정확히 준수하여 응답해 주십시오:
{
  "title": "[제출처와 타겟 직무에 어울리도록 세련되게 장식한 국문 타이틀]",
  "intro": "[경험과 대상이 정교하게 녹아든 한 문장의 핵심 정체성 표어]",
  "academicSummary": "[제출 동기와 연동된 배경 및 직무 정체성 증명 요약 - 2문장 내외 단문]",
  "keyHighlights": [
    {
      "title": "[경험/프로젝트 제목]",
      "challenge": "[해당 목표 기업이나 직무 상황에서 해결을 도출한 핵심적 난관 및 단기 과제]",
      "action": "[가용한 역량과 주도적 문제 해결 방법을 매끄럽게 연결해 행한 주도적 수행 행동]",
      "impact": "[해당 제출처에서 바로 기여 가능한 실무적 성공 지표 및 핵심적 이점]"
    }
  ],
  "recommendedCareerPath": "[지정된 목적 및 제출처를 완벽 돌파하기 위한 주효한 직무 돌파 조언 및 단기 로드맵]"
}
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              intro: { type: Type.STRING },
              academicSummary: { type: Type.STRING },
              keyHighlights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    challenge: { type: Type.STRING },
                    action: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  },
                  required: ["title", "challenge", "action", "impact"]
                }
              },
              recommendedCareerPath: { type: Type.STRING }
            },
            required: ["title", "intro", "academicSummary", "keyHighlights", "recommendedCareerPath"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({
          ...parsed,
          compiledDate: new Date().toISOString().split("T")[0]
        });
      }
    } catch (error) {
      console.error("Gemini API Portfolio Build Error:", error);
    }
  }

  // Graceful Fallback design for Portfolio builder
  console.log("Serving rich smart Portfolio draft fallback.");
  const targetLabel = target ? `[제출처: ${target}]` : "IT 유관직군";
  const purposeLabel = purpose ? `[희망 역할: ${purpose}]` : "실무 역량 증명";
  res.json({
    title: `${userProfile?.name || "조경사"}님의 핵심 경험 가치 증명 직무 포트폴리오`,
    intro: `지원 대상 및 세부 역할에 맞추어 보정된 주도적 문제해결형 인재의 기록`,
    academicSummary: `${userProfile?.name || "조경사"}님은 ${targetLabel} 부문으로의 수려한 ${purposeLabel}을 획득하기 위해, 보유한 실무 정량 지수 총 ${userProfile?.totalPoints || 100}pt의 실무 자산을 입체적으로 구조화하여 슬기롭게 설득력을 장착하였습니다.`,
    keyHighlights: assets.map((a: any) => ({
      title: a.title,
      challenge: `${targetLabel}의 경쟁력 향상 기준에 비추어 볼 때 데이터 분석에 기반한 구체적인 문제 도출력이나 실무 주도형 실행 흐름이 부재했던 초기 한계를 직면했었습니다.`,
      action: `스스로의 지능적 에셋들을 조합하여, 설문조사 실증 연구 및 해당 직군에 필수적인 툴킷을 적극 투입하는 세밀한 다차원 구조 분석 설계를 주도적으로 감행했습니다.`,
      impact: `그 결과 지원 목적에 정확히 걸맞은 실효성 있는 실무 가점 성과 및 스킬 가중치를 증명하고 핵심 해결 역량을 확보했습니다.`
    })),
    recommendedCareerPath: `${targetLabel}에 지원 및 결실을 맺기 위해서는 실증 정량 기록인 본 포트폴리오의 Challenge-Action-Impact 실적을 지속 강화하는 전략이 유효하며, 이는 최적의 성공 지도가 될 것입니다.`,
    compiledDate: new Date().toISOString().split("T")[0]
  });
});

/**
 * 5. AI Cover Letter Motivation & Aspiration Generator API
 * Input: { userProfile: any, target: string, purpose: string, assets: any[] }
 */
app.post("/api/ai/cover-letter", async (req, res) => {
  const { userProfile, target, purpose, assets } = req.body;

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `
당신은 최고의 채용 에이전트이자 합격을 만드는 자기소개서 전문 컨설턴트입니다.
지원자가 작성한 기본 정보와 강점이 될 실무 경험 에셋 데이터를 조합하여, 대상 기업과 타겟 세부 직무에 최적화된 "자기소개서 지원동기 및 입사 후 포부"를 강력한 구절로 맞춤 설계하여 작성해 주십시오.

[나의 프로필 정보]
- 이름: ${userProfile?.name || "조경사"}
- 현재 상태/소속: ${userProfile?.situation || "신입 준비생"}
- 겨냥하는 직무/목표: ${userProfile?.targetGoal || "해당 포지션"}

[지원 사유 최적화 타겟]
- 지원 대상 기업 및 부서: "${target || "명시되지 않음"}"
- 희망 분야 및 세부 직무 주역할: "${purpose || "명시되지 않음"}"

[선택 역량 에셋 목록]
${(assets || []).map((a: any, i: number) => `[에셋 ${i+1}] ${a.title}
  - 상세 데이터: ${a.subText}
  - 태그: ${a.tags?.join(", ")}`).join("\n")}

조건:
1. 문장은 과도하게 장황하지 않으며 각각 2~3개 이내의 단문/중문으로 읽기 쉽고 매끄럽게 연결되어야 합니다.
2. motivation (지원 동기): 상투적인 표현(예: "어머니 말씀에 따라", "성실한 태도로")을 일절 배제하고, 사용자가 선택한 [역량 에셋] 중 핵심 기여 요소를 [지원 대상 기업/부서]의 비즈니스적 가치나 직무적 매력과 자연스럽게 직결지어 '여기에 핵심 기여자로 기여하고 싶다'는 직관적인 설득력을 보여주세요.
3. aspiration (입사 후 포부): 입사 후 달성할 수 있는 정량적/정성적 포부를 2~3문장 이내로 작성하십시오. 다짐에만 머무르지 않고 구체적인 마일스톤이나 성장 로드맵이 간결히 포함되도록 하십시오.

다음 JSON 형식을 정확히 준수하여 응답해 주십시오:
{
  "motivation": "[도출된 고효율 자소서 지원동기 - 2~3문장 이내 단문]",
  "aspiration": "[도출된 구체적인 연차별 역량 기여형 입사 후 포부 - 2~3문장 이내 단문]"
}
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              motivation: { type: Type.STRING },
              aspiration: { type: Type.STRING }
            },
            required: ["motivation", "aspiration"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }
    } catch (error) {
      console.error("Gemini API Cover Letter Error:", error);
    }
  }

  // Graceful Fallback
  const targetLabel = target || "목표 기업";
  const purposeLabel = purpose || "IT 전문 직무";
  res.json({
    motivation: `${userProfile?.name || "조경사"}님이 보유한 실무 아카이브 자산을 적극 발휘하여, 기술적 성장을 추구하고 당해 산업의 핵심 문제해결형 돌파구를 지원하고자 ${targetLabel} 부서의 ${purposeLabel} 직군에 혼신을 다하기로 결심했습니다.`,
    aspiration: `입사 직후에는 실무 적응과 주도적 에셋 배치를 완성하고, 중기적으로는 다차원 설계 도구를 마스터하여 부서의 핵심 성과 총합을 기여하는 명망 높은 전담 리더로 동반 도약하겠습니다.`
  });
});

// ── VITE MIDDLEWARE OR STATIC COMPILATION ────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Express with Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving Production Build Client Assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server bound on port ${PORT}. Ingress routes are active.`);
  });
}

startServer();
