import { ARCHIVE_CASE_SEEDS } from "@/data/archive-cases";
import {
  clampToScale,
  fromNineScale,
  scaleMax,
  toNineScale,
  type GradeScale,
} from "@/lib/parent/grade-scale";

export type ReachOption = {
  university: string;
  major: string;
  fit: "안정" | "적정" | "소신" | "도전";
  note: string;
};

export type ActivityPlan = {
  title: string;
  why: string;
  steps: string[];
  subjects: string[];
  evidenceTip: string;
};

export type ActivityExample = {
  sourceLabel: string;
  university: string;
  major: string;
  title: string;
  preview: string;
  tags: string[];
  takeaway: string;
};

export type GradeGapAnalysis = {
  scale: GradeScale;
  scaleLabel: string;
  currentGrade: number;
  targetGradeNeeded: number;
  gap: number;
  /** 학기당 현실적 상승 폭(등급 숫자 감소) 추정 — 선택 스케일 기준 */
  realisticPerSemester: number;
  semestersLeft: number;
  feasibleGap: number;
  feasibility: "적정" | "도전적이나 가능" | "과도한 기대 — 전략 조정 권장";
  feasibilityDetail: string;
  /** 차트용: 현재→목표→현실 도달선 (선택 스케일 숫자) */
  chart: {
    labels: string[];
    currentLine: number[];
    targetLine: number[];
    realisticLine: number[];
    yMax: number;
  };
};

export type ParentReportResult = {
  summary: string;
  strengths: string[];
  risks: string[];
  nextActions: string[];
  fitBand: string;
  gradeGap: GradeGapAnalysis;
  reachable: ReachOption[];
  stretchTargets: ReachOption[];
  activities: ActivityPlan[];
  examples: ActivityExample[];
};

export type ParentReportInput = {
  studentName: string;
  grade: string;
  mockScore: number;
  gradeScale: GradeScale;
  targetUniv: string;
  targetMajor: string;
  recordNotes: string;
};

/** 목표 대학 필요 등급 — 9등급제 기준 추정 후 선택 스케일로 변환 */
export function estimateTargetGradeNeeded(
  targetUniv: string,
  targetMajor: string,
  scale: GradeScale = "9",
): number {
  const text = `${targetUniv} ${targetMajor}`.toLowerCase();
  const hardMajor =
    /의|치의|한의|약학|컴공|컴퓨터|반도체|전기|전자|인공지능|ai|경영|경제/.test(text);

  let nine = 3.0;
  if (/서울대|서울대학교|snu/.test(text)) nine = hardMajor ? 1.2 : 1.5;
  else if (/연세대|고려대|연세|고려|yonsei|korea univ/.test(text)) nine = hardMajor ? 1.5 : 1.9;
  else if (/카이스트|kaist|포항공대|포스텍|postech|의대|의예/.test(text)) nine = 1.3;
  else if (/성균관|한양|서강|이화|중앙|경희|한국외대|서울시립|건국|동국|홍익/.test(text))
    nine = hardMajor ? 2.2 : 2.6;
  else if (/부산대|경북대|전남대|충남대|전북대|인하|아주|건국|단국/.test(text)) nine = 3.2;

  return fromNineScale(nine, scale);
}

function semestersRemaining(gradeLabel: string): number {
  if (gradeLabel === "고1") return 5;
  if (gradeLabel === "고2") return 3;
  return 1;
}

export function analyzeGradeGap(
  currentGrade: number,
  targetUniv: string,
  targetMajor: string,
  gradeLabel: string,
  scale: GradeScale = "9",
): GradeGapAnalysis {
  const safeCurrent = clampToScale(currentGrade, scale);
  const targetGradeNeeded = estimateTargetGradeNeeded(targetUniv, targetMajor, scale);
  const gap = Math.max(0, +(safeCurrent - targetGradeNeeded).toFixed(2));
  const semestersLeft = semestersRemaining(gradeLabel);
  // 5등급제는 등급 폭이 좁아 학기당 개선 폭도 작게 잡음
  const realisticPerSemester =
    scale === "5"
      ? gradeLabel === "고3"
        ? 0.15
        : 0.25
      : gradeLabel === "고3"
        ? 0.25
        : 0.4;
  const feasibleGap = +(realisticPerSemester * semestersLeft).toFixed(2);
  const scaleLabel = scale === "5" ? "5등급제" : "9등급제";
  const yMax = scaleMax(scale);

  let feasibility: GradeGapAnalysis["feasibility"];
  let feasibilityDetail: string;

  if (gap <= feasibleGap * 0.85) {
    feasibility = "적정";
    feasibilityDetail = `[${scaleLabel}] 남은 약 ${semestersLeft}학기 동안 학기당 ${realisticPerSemester}등급 내외 상승을 가정하면, 목표 수준까지 현실적인 구간입니다. 내신·모의 병행과 세특 심화가 핵심입니다.`;
  } else if (gap <= feasibleGap * 1.35) {
    feasibility = "도전적이나 가능";
    feasibilityDetail = `[${scaleLabel}] 필요 상승폭(${gap})이 현실 추정(${feasibleGap})보다 다소 큽니다. 정시/교과/학종 중 강점 전형을 좁히고, 약점 과목 집중 보강이 필요합니다.`;
  } else {
    feasibility = "과도한 기대 — 전략 조정 권장";
    feasibilityDetail = `[${scaleLabel}] 목표와의 등급 갭(${gap})이 남은 기간 현실 상승 폭을 크게 웃돕니다. 목표를 ‘도전’으로 유지하되, 적정·안정 지원군을 반드시 병행하세요.`;
  }

  const steps = Math.max(2, semestersLeft);
  const labels = ["현재", ...Array.from({ length: steps }, (_, i) => `${i + 1}학기 후`)];
  const currentLine = labels.map(() => safeCurrent);
  const targetLine = labels.map(() => targetGradeNeeded);
  const realisticLine = labels.map((_, i) =>
    Math.max(1, +(safeCurrent - realisticPerSemester * i).toFixed(2)),
  );

  return {
    scale,
    scaleLabel,
    currentGrade: safeCurrent,
    targetGradeNeeded,
    gap,
    realisticPerSemester,
    semestersLeft,
    feasibleGap,
    feasibility,
    feasibilityDetail,
    chart: { labels, currentLine, targetLine, realisticLine, yMax },
  };
}

/** 현재 등급대에서 참고용 지원 가능군 */
export function getReachableOptions(currentGrade: number): {
  reachable: ReachOption[];
  stretch: ReachOption[];
} {
  const g = currentGrade || 5;

  const pool: (ReachOption & { min: number; max: number; stretch?: boolean })[] = [
    {
      university: "서울대학교",
      major: "인문·사회 계열(참고)",
      fit: "도전",
      note: "최상위 학종·교과 경쟁. 세특 깊이와 전공 적합성이 핵심",
      min: 1,
      max: 1.6,
      stretch: true,
    },
    {
      university: "연세대학교",
      major: "사회과학·경영 계열(참고)",
      fit: "소신",
      note: "학종에서 탐구·리더십 스토리가 강할 때",
      min: 1.3,
      max: 2.2,
    },
    {
      university: "고려대학교",
      major: "자연·공과 계열(참고)",
      fit: "적정",
      note: "수학·과탐 세특과 프로젝트형 탐구가 유리",
      min: 1.4,
      max: 2.3,
    },
    {
      university: "성균관대학교",
      major: "소프트웨어·공학 계열(참고)",
      fit: "적정",
      note: "데이터·실험·코딩 산출물이 있으면 설득력↑",
      min: 1.8,
      max: 2.8,
    },
    {
      university: "한양대학교",
      major: "공과대학(참고)",
      fit: "안정",
      note: "공학 설계·실험 보고서형 활동과 잘 맞음",
      min: 2.0,
      max: 3.2,
    },
    {
      university: "중앙대학교",
      major: "미디어·경영·공학(참고)",
      fit: "적정",
      note: "교과+학종 병행 시 포트폴리오형 활동 권장",
      min: 2.3,
      max: 3.5,
    },
    {
      university: "경희대학교",
      major: "생명·보건·사회 계열(참고)",
      fit: "안정",
      note: "실험·봉사·진로 탐구의 일관성이 중요",
      min: 2.5,
      max: 3.8,
    },
    {
      university: "서울시립대학교",
      major: "도시·행정·공과(참고)",
      fit: "안정",
      note: "공공성·데이터 기반 탐구와 연결하기 좋음",
      min: 2.4,
      max: 3.6,
    },
    {
      university: "부산대학교",
      major: "주요 학과(참고)",
      fit: "안정",
      note: "지역거점국립대 — 내신·세특 균형형",
      min: 2.8,
      max: 4.2,
    },
    {
      university: "아주대학교",
      major: "공학·IT 계열(참고)",
      fit: "적정",
      note: "프로젝트·코딩·실험 산출물 강조",
      min: 2.6,
      max: 4.0,
    },
    {
      university: "인하대학교",
      major: "공과·물류·항공(참고)",
      fit: "안정",
      note: "실습·탐구 기록의 구체성이 가점",
      min: 2.8,
      max: 4.3,
    },
    {
      university: "단국대학교",
      major: "자연·인문 계열(참고)",
      fit: "안정",
      note: "현재 등급대에서 안정 지원 후보로 검토",
      min: 3.2,
      max: 5.0,
    },
  ];

  const reachable = pool
    .filter((p) => g >= p.min && g <= p.max && !p.stretch)
    .slice(0, 6)
    .map(({ university, major, fit, note }) => ({ university, major, fit, note }));

  const stretch = pool
    .filter((p) => g > p.max && g <= p.max + 1.2)
    .slice(0, 4)
    .map(({ university, major, note }) => ({
      university,
      major,
      fit: "도전" as const,
      note: `현재보다 상위 — ${note}`,
    }));

  // 등급이 매우 좋을 때
  if (reachable.length < 3) {
    const fallback = pool
      .filter((p) => g <= p.max)
      .slice(0, 5)
      .map(({ university, major, fit, note }) => ({ university, major, fit, note }));
    return { reachable: fallback, stretch };
  }

  return { reachable, stretch };
}

function detectTrack(targetMajor: string, targetUniv: string, notes: string): string {
  const t = `${targetMajor} ${targetUniv} ${notes}`.toLowerCase();
  if (/의|약|간호|수의|치의|한의/.test(t)) return "med";
  if (/컴|소프트|정보|ai|인공지능|데이터|전자|전기|반도체|기계|공학/.test(t)) return "eng";
  if (/경영|경제|금융|회계|무역/.test(t)) return "biz";
  if (/생명|바이오|화학|환경|생태/.test(t)) return "bio";
  if (/사회|심리|교육|행정|미디어|신문|정치/.test(t)) return "soc";
  return "general";
}

export function buildActivityPlans(
  targetUniv: string,
  targetMajor: string,
  recordNotes: string,
): ActivityPlan[] {
  const track = detectTrack(targetMajor, targetUniv, recordNotes);
  const majorLabel = targetMajor || "희망 전공";
  const univLabel = targetUniv || "목표 대학";

  const common: ActivityPlan[] = [
    {
      title: `${majorLabel} 연계 ‘탐구 질문’ 1개 고정하기`,
      why: `${univLabel} 학종/교과에서 평가자가 가장 먼저 보는 것은 ‘왜 이 전공인가’의 일관성입니다.`,
      steps: [
        "관심 현상 1개를 문장형 탐구 질문으로 쓰기 (예: ~는 왜 ~한가?)",
        "관련 교과 개념 3개를 교과서에서 찾아 노트에 연결",
        "4~6주 관찰·실험·조사 중 한 방법으로 데이터/사례 확보",
        "결과·한계·후속 질문을 세특/수행평가 문장으로 정리",
      ],
      subjects: ["희망 전공 관련 교과", "국어(보고서)", "정보/수학(데이터)"],
      evidenceTip: "사진·표·그래프·실험 노트 원본을 날짜와 함께 남겨 두세요.",
    },
  ];

  const byTrack: Record<string, ActivityPlan[]> = {
    eng: [
      {
        title: "작은 데이터·코딩 프로젝트 (4주)",
        why: "공대·컴공·정보 계열은 ‘문제를 수치로 정의하고 해결한 과정’이 세특 설득력을 만듭니다.",
        steps: [
          "교내/생활 데이터 주제 선정 (급식, 전력, 이동, 설문 등)",
          "수집 프로토콜 작성 → 전처리 규칙 문서화",
          "파이썬/스프레드시트로 시각화 1장 이상",
          "개선안 1개를 제안하고 전후 비교(가능하면)",
        ],
        subjects: ["정보", "수학", "과학"],
        evidenceTip: "코드 일부·그래프·한계(표본)를 수행평가 보고서에 첨부",
      },
      {
        title: "공학 설계 미니 챌린지",
        why: "설계-제작-테스트-개선 사이클이 전공 적합성의 핵심 증거입니다.",
        steps: [
          "요구사항 정의 (누가, 어떤 상황에서, 무엇을)",
          "스케치/블록도 작성",
          "프로토타입 1회 제작 또는 시뮬레이션",
          "실패 요인과 개선안을 성찰 일지로 기록",
        ],
        subjects: ["기술·가정", "물리", "정보"],
        evidenceTip: "과정 사진 3장 + 실패 기록 1건을 남기면 진정성이 높아집니다.",
      },
    ],
    bio: [
      {
        title: "변인 통제형 생명·환경 실험",
        why: "생명/바이오/환경 계열은 실험 설계의 엄밀함이 곧 학업 역량입니다.",
        steps: [
          "독립·종속·통제 변인 표로 정리",
          "조건 3개 이상, 반복 측정 설계",
          "평균·편차·그래프로 결과 제시",
          "현장 외삽 한계를 스스로 서술",
        ],
        subjects: ["생명과학", "화학", "지구과학"],
        evidenceTip: "실험 노트 페이지 스캔 + 그래프를 세특 근거로 보관",
      },
    ],
    med: [
      {
        title: "보건·인체 관련 자기보고/문헌 탐구",
        why: "의약계열은 윤리·근거·관찰의 균형이 중요합니다. 임상 흉내보다 ‘과학적 태도’를 보이세요.",
        steps: [
          "수면·스트레스·생활습관 등 안전 주제 선택",
          "2주 이상 자기보고 또는 공개 통계 분석",
          "교과서 개념(항상성, 면역 등)과 연결",
          "윤리(동의·익명)와 한계를 명시",
        ],
        subjects: ["생명과학", "화학", "윤리"],
        evidenceTip: "개인정보 없는 익명 데이터만 사용하세요.",
      },
    ],
    biz: [
      {
        title: "가격·선택 행동 미니 조사",
        why: "경영·경제는 개념을 일상 사례에 적용하고 표집 한계를 아는 태도가 돋보입니다.",
        steps: [
          "PB/NB 가격 또는 교내 소비 주제 선정",
          "관찰 표 + 간단 설문(30명 내외)",
          "교차표/간단한 비교로 해석",
          "가격탄력성 등 교과 개념과 연결",
        ],
        subjects: ["경제", "수학", "사회·문화"],
        evidenceTip: "설문지·원자료(익명)와 분석 표를 첨부",
      },
    ],
    soc: [
      {
        title: "설문·교차분석 소논문형 탐구",
        why: "사회계열은 연구 질문·표집 편향·해석의 신중함이 세특 품질을 가릅니다.",
        steps: [
          "연구 질문을 ‘관계/차이’ 형태로 쓰기",
          "리커트 문항 설계 → 동의·익명 확보",
          "교차표로 경향 확인 (인과 단정 금지)",
          "정책·제도 함의 1문단 제안",
        ],
        subjects: ["사회·문화", "정치와 법", "국어"],
        evidenceTip: "연구 윤리 체크리스트를 보고서에 포함",
      },
    ],
    general: [
      {
        title: "전공 적합형 ‘프로젝트 1개’ 깊게",
        why: "활동 개수보다 한 주제의 깊이가 합격 스토리를 만듭니다.",
        steps: [
          "희망 전공 키워드 5개 추출",
          "그중 1개로 4주 프로젝트 설계",
          "중간 점검(선생님/친구 피드백) 1회",
          "결과물을 세특·수행평가·발표로 재활용",
        ],
        subjects: ["전공 관련 교과", "국어", "정보"],
        evidenceTip: "과정 산출물(초안→최종)을 날짜별로 보관",
      },
    ],
  };

  return [...common, ...(byTrack[track] ?? byTrack.general)].slice(0, 3);
}

export function pickActivityExamples(
  targetMajor: string,
  targetUniv: string,
  limit = 3,
): ActivityExample[] {
  const keywords = `${targetMajor} ${targetUniv}`.toLowerCase();
  const scored = ARCHIVE_CASE_SEEDS.map((c) => {
    const hay = `${c.university} ${c.major} ${c.subject} ${c.title} ${c.tags.join(" ")}`.toLowerCase();
    let score = 0;
    for (const token of keywords.split(/[\s,/·]+/).filter(Boolean)) {
      if (token.length >= 2 && hay.includes(token.toLowerCase())) score += 2;
    }
    if (/컴|정보|데이터|소프트/.test(keywords) && /정보|컴퓨터|데이터|파이썬/.test(hay))
      score += 3;
    if (/생명|바이오|의|환경/.test(keywords) && /생명|환경|생태|화학/.test(hay)) score += 3;
    if (/경제|경영/.test(keywords) && /경제|가격|소비자/.test(hay)) score += 3;
    if (/사회|심리|교육/.test(keywords) && /사회|설문|공동체/.test(hay)) score += 3;
    return { c, score };
  })
    .sort((a, b) => b.score - a.score)
    .map(({ c }) => c);

  const picked = (scored[0]?.id ? scored : ARCHIVE_CASE_SEEDS).slice(0, limit);

  return picked.map((c) => ({
    sourceLabel: "Viago 익명 합격사례 아카이브",
    university: c.university,
    major: c.major,
    title: c.title,
    preview: c.preview,
    tags: c.tags,
    takeaway: `이 사례처럼 ‘문제 정의 → 방법 → 근거(데이터/실험) → 한계 → 후속’ 구조를 ${c.subject} 세특에 담아 보세요.`,
  }));
}

export function buildParentReport(input: ParentReportInput): ParentReportResult {
  const scale = input.gradeScale ?? "9";
  const score = input.mockScore;
  const gradeGap = analyzeGradeGap(
    score,
    input.targetUniv,
    input.targetMajor,
    input.grade,
    scale,
  );
  // 대학 밴드는 9등급 감각으로 매칭
  const { reachable, stretch } = getReachableOptions(toNineScale(score, scale));
  const activities = buildActivityPlans(input.targetUniv, input.targetMajor, input.recordNotes);
  const examples = pickActivityExamples(input.targetMajor, input.targetUniv, 3);

  const fitBand = `${gradeGap.scaleLabel} · ${gradeGap.feasibility} · 목표 추정 ${gradeGap.targetGradeNeeded} (현재 ${gradeGap.currentGrade})`;

  const summary = `${input.studentName || "학생"} 학생(${input.grade}, ${gradeGap.scaleLabel})의 최근 모의 평균 등급은 약 ${gradeGap.currentGrade}입니다. ‘${input.targetUniv || "목표 대학"} / ${input.targetMajor || "희망 학과"}’ 기준으로 추정 필요 등급은 약 ${gradeGap.targetGradeNeeded}이며, 갭은 ${gradeGap.gap}등급입니다. 판단: ${gradeGap.feasibility}. ${gradeGap.feasibilityDetail} 아래에서는 현재 등급대 지원 가능군, 목표 맞춤 활동 로드맵, 실제 선배 사례를 함께 제시합니다.`;

  const strengths = [
    input.recordNotes.trim()
      ? "입력하신 생기부·활동 메모에서 확장 가능한 키워드가 확인됩니다. 세특 문장으로 구조화하면 설득력이 커집니다."
      : "정량(모의 등급)과 목표 대학·학과가 입력되어 전략 프레임을 구성할 수 있습니다.",
    gradeGap.feasibility === "적정"
      ? "목표와 현재 실력의 거리가 관리 가능한 구간에 가깝습니다."
      : "도전 목표를 유지하되 적정·안정 카드를 병행하면 리스크를 줄일 수 있습니다.",
    `${input.grade} 기준으로 남은 학기(약 ${gradeGap.semestersLeft}학기) 동안 세특·수행평가를 ‘전공 스토리’로 묶을 시간이 ${input.grade === "고3" ? "촉박하지만 집중하면" : "아직"} 있습니다.`,
  ];

  const risks = [
    !score
      ? "모의 등급 입력이 부정확하면 정량 진단 신뢰도가 떨어집니다."
      : "단일 회차 모의만으로는 추세가 부족할 수 있습니다. 최근 2~3회 평균을 함께 보세요.",
    gradeGap.feasibility === "과도한 기대 — 전략 조정 권장"
      ? "목표만 고수하면 원서 전략이 한쪽으로 치우칠 수 있습니다."
      : "세특이 추상적이면 등급이 좋아도 학종 설득력이 약해질 수 있습니다.",
    "전형(학종/교과/정시)을 나누지 않으면 활동 우선순위가 흐려집니다.",
  ];

  const nextActions = [
    `이번 달: ${activities[0]?.title ?? "전공 연계 탐구 1건"} 착수`,
    "Viago 세특 생성기로 학업·진로·공동체 3버전 초안 → 본인 문장으로 다듬기",
    "합격사례 아카이브에서 동일 계열 2건 벤치마킹 후 ‘내가 빠진 단계’ 체크리스트 만들기",
    gradeGap.gap > 0
      ? `약점 과목 주 2회 복습 루틴 + 학기당 ${gradeGap.realisticPerSemester}등급 내외 개선 목표 점검`
      : "현 등급 유지·심화: 모의 오답 유형 노트와 세특 심화 병행",
  ];

  return {
    summary,
    strengths,
    risks,
    nextActions,
    fitBand,
    gradeGap,
    reachable,
    stretchTargets: stretch,
    activities,
    examples,
  };
}
