/** 검색·사례 생성용 대학·전공·활동 템플릿 (익명·합성 벤치마킹) */

export const UNIVERSITIES = [
  "서울대학교",
  "연세대학교",
  "고려대학교",
  "KAIST",
  "POSTECH",
  "성균관대학교",
  "한양대학교",
  "서강대학교",
  "중앙대학교",
  "경희대학교",
  "한국외국어대학교",
  "서울시립대학교",
  "이화여자대학교",
  "건국대학교",
  "동국대학교",
  "홍익대학교",
  "인하대학교",
  "아주대학교",
  "부산대학교",
  "경북대학교",
] as const;

export type MajorTrack =
  | "cs"
  | "eng"
  | "bio"
  | "med"
  | "biz"
  | "econ"
  | "soc"
  | "media"
  | "chem"
  | "phys"
  | "edu"
  | "design";

export const MAJORS: { name: string; track: MajorTrack; aliases: string[] }[] = [
  { name: "컴퓨터공학부", track: "cs", aliases: ["컴공", "컴퓨터", "소프트웨어", "cs", "코딩"] },
  { name: "소프트웨어학과", track: "cs", aliases: ["소프트", "소프트웨어", "개발"] },
  { name: "인공지능학과", track: "cs", aliases: ["ai", "인공지능", "머신러닝"] },
  { name: "전기전자공학부", track: "eng", aliases: ["전기", "전자", "반도체"] },
  { name: "기계공학부", track: "eng", aliases: ["기계", "자동차", "로봇"] },
  { name: "화학생물공학부", track: "eng", aliases: ["화생공", "화학공학"] },
  { name: "생명공학과", track: "bio", aliases: ["생명공학", "바이오", "생명"] },
  { name: "생명과학과", track: "bio", aliases: ["생과", "생물학"] },
  { name: "의예과", track: "med", aliases: ["의대", "의학", "의예"] },
  { name: "약학과", track: "med", aliases: ["약대", "약학"] },
  { name: "간호학과", track: "med", aliases: ["간호"] },
  { name: "경영학과", track: "biz", aliases: ["경영", "경영학", "비즈니스"] },
  { name: "경제학과", track: "econ", aliases: ["경제", "경제학"] },
  { name: "사회학과", track: "soc", aliases: ["사회", "사회학"] },
  { name: "심리학과", track: "soc", aliases: ["심리"] },
  { name: "언론정보학부", track: "media", aliases: ["언론", "미디어", "신문방송"] },
  { name: "화학과", track: "chem", aliases: ["화학"] },
  { name: "물리학과", track: "phys", aliases: ["물리", "물리학"] },
  { name: "교육학과", track: "edu", aliases: ["교육", "교대"] },
  { name: "시각디자인과", track: "design", aliases: ["디자인", "시각디자인"] },
];

export type ActivityTemplate = {
  id: string;
  track: MajorTrack | "any";
  subject: string;
  title: string;
  preview: string;
  fullText: string;
  performanceText: string | null;
  tags: string[];
};

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  {
    id: "data-campaign",
    track: "cs",
    subject: "정보",
    title: "교내 데이터 수집·시각화와 행동 유도 캠페인",
    preview:
      "교내 데이터를 직접 계측·정리하고 파이썬으로 패턴을 시각화한 뒤 학급 캠페인으로 확장한 탐구…",
    fullText: `정보 교과 세특
학생은 교내 데이터를 문제로 설정하고 수집 프로토콜을 설계하였다. 결측·이상치를 제외하는 전처리 규칙을 문서화한 뒤 파이썬으로 시각화하였고, 데이터 기반 행동 유도 캠페인을 적용·재측정하였다. 표본 한계를 스스로 언급하며 후속 실험을 제안하는 등 문제 정의–분석–소통–검증의 전 과정을 주도적으로 수행하였다.`,
    performanceText: `수행평가 요지
탐구 질문·데이터 수집·시각화·캠페인·재측정·한계 명시`,
    tags: ["데이터분석", "파이썬", "시각화", "공공문제"],
  },
  {
    id: "ml-classify",
    track: "cs",
    subject: "정보",
    title: "간단한 분류 모델로 본 패턴 인식 탐구",
    preview:
      "공개/교내 데이터를 나눠 학습·검증하고, 정확도와 오분류 사례를 분석한 인공지능 기초 탐구…",
    fullText: `정보 교과 세특
학생은 분류 문제를 정의하고 학습/검증 분할, 특성 선택, 성능 지표(정확도·오분류)를 정리하였다. 단순 모델의 한계와 데이터 편향을 논의하며 인공지능의 윤리적·기술적 쟁점을 교과 개념과 연결하였다.`,
    performanceText: `보고서: 문제정의–데이터–모델–평가–한계–윤리`,
    tags: ["인공지능", "분류", "데이터", "윤리"],
  },
  {
    id: "arduino-sensor",
    track: "eng",
    subject: "기술·가정",
    title: "센서 기반 간이 측정 장치 설계·개선",
    preview:
      "센서와 마이크로컨트롤러로 측정 장치를 만들고 오차 요인을 분석·개선한 공학 설계 탐구…",
    fullText: `기술·가정 교과 세특
학생은 요구사항을 정의하고 센서 회로·데이터 로깅을 구현하였다. 측정 오차 원인을 분해하고 차폐·보정으로 개선을 확인하며 설계–제작–평가 사이클을 완결하였다.`,
    performanceText: `설계 보고서: 요구사항, 회로, 테스트, 개선`,
    tags: ["센서", "설계", "오차분석", "공학"],
  },
  {
    id: "pendulum",
    track: "phys",
    subject: "물리학",
    title: "스마트폰 센서를 활용한 단진자 주기 측정",
    preview: "이론값과 실험값을 비교하고 오차 요인을 정량 분석한 물리 실험…",
    fullText: `물리학 교과 세특
학생은 단진자 주기 관계를 검증하기 위해 센서 데이터로 주기를 산출하고 상대오차를 계산하였다. 진폭·공기저항 등 오차 요인을 검토하고 재실험으로 개선을 확인하였다.`,
    performanceText: `실험: 측정–평균–오차–개선`,
    tags: ["실험", "역학", "오차분석"],
  },
  {
    id: "microplastic",
    track: "bio",
    subject: "생명과학",
    title: "미세플라스틱 농도에 따른 생물 반응 비교",
    preview: "농도 조건을 나눠 생존율·행동을 비교하고 변인 통제를 명시한 생명과학 탐구…",
    fullText: `생명과학 교과 세특
학생은 독립·종속·통제 변인을 구분하고 반복 측정 후 경향을 그래프로 제시하였다. 실험실과 현장의 차이를 한계로 명시하며 환경·생태 이슈를 교과 개념과 연결하였다.`,
    performanceText: `가설–실험–데이터–한계–후속`,
    tags: ["실험설계", "환경", "변인통제"],
  },
  {
    id: "sleep-focus",
    track: "med",
    subject: "생명과학",
    title: "수면 시간과 주간 집중도의 자기보고 상관 탐색",
    preview: "2주 수면 일지와 집중도 자기평가를 비교한 건강·인지 탐구…",
    fullText: `생명과학 교과 세특
학생은 수면과 인지의 관계를 자기보고로 탐구하고 교란변수(시험·카페인)를 한계로 명시하였다. 생체리듬 개념과 연결하며 근거 중심 서술 태도를 보여 주었다.`,
    performanceText: null,
    tags: ["수면", "건강", "자기탐구"],
  },
  {
    id: "pb-pricing",
    track: "econ",
    subject: "경제",
    title: "PB·NB 가격 전략과 소비자 선택 요인 조사",
    preview: "매장 관찰과 설문으로 가격 탄력성·브랜드 효과를 검토한 경제 탐구…",
    fullText: `경제 교과 세특
학생은 PB/NB 가격을 수집하고 설문으로 선택 요인을 비교하였다. 편의표본 한계를 스스로 지적하며 일상 가격 전략을 경제 모형으로 설명하였다.`,
    performanceText: null,
    tags: ["가격탄력성", "조사", "소비자"],
  },
  {
    id: "startup-canvas",
    track: "biz",
    subject: "통합사회",
    title: "교내 문제 해결형 비즈니스 모델 캔버스 설계",
    preview: "고객·가치제안·채널을 정리하고 인터뷰로 검증한 창업·경영 탐구…",
    fullText: `통합사회·경영 연계 세특
학생은 교내 문제를 고객 여정으로 분석하고 비즈니스 모델 캔버스를 작성하였다. 잠재 사용자 인터뷰로 가설을 수정하며 경영학적 문제 해결 과정을 보여 주었다.`,
    performanceText: `BMC–인터뷰–피벗–발표`,
    tags: ["경영", "인터뷰", "문제해결"],
  },
  {
    id: "club-survey",
    track: "soc",
    subject: "사회·문화",
    title: "동아리 참여와 학교 소속감의 설문·교차분석",
    preview: "리커트 설문과 교차표로 관계를 살펴보고 표집 편향을 명시한 사회 탐구…",
    fullText: `사회·문화 교과 세특
학생은 연구 질문을 설정하고 설문을 실시하였다. 인과 단정을 피하고 선택 편향을 명시하며 연구 윤리(동의·익명)를 준수하였다.`,
    performanceText: null,
    tags: ["설문", "연구윤리", "공동체"],
  },
  {
    id: "media-frame",
    track: "media",
    subject: "국어",
    title: "동일 이슈의 언론 프레임 비교 분석",
    preview: "두 매체의 제목·취재원을 비교해 프레임 차이를 분석한 미디어 리터러시 탐구…",
    fullText: `국어·미디어 연계 세특
학생은 동일 이슈 보도의 프레임·취재원·어휘를 비교표로 정리하고 수용자 해석에 미치는 영향을 논의하였다. 비판적 읽기와 근거 제시 역량을 심화하였다.`,
    performanceText: `비교표–해석–한계–제언`,
    tags: ["미디어", "프레임", "비판적사고"],
  },
  {
    id: "indicator",
    track: "chem",
    subject: "화학",
    title: "천연 지시약의 pH 추정 한계와 정량 보완",
    preview: "적양배추 지시약과 시험지를 비교하며 정성 분석의 한계를 논의한 화학 탐구…",
    fullText: `화학 교과 세특
학생은 천연 지시약의 색 변화를 관찰하고 시험지와 대조하였다. 주관성·조명 오인을 한계로 정리하고 정량 보완 방법을 제안하였다.`,
    performanceText: null,
    tags: ["산염기", "실험", "분석"],
  },
  {
    id: "battery-safety",
    track: "chem",
    subject: "화학",
    title: "리튬이온 배터리 열화 요인 문헌 조사와 안전 수칙",
    preview: "열화·열폭주 자료를 정리하고 생활 안전 체크리스트를 제안한 탐구…",
    fullText: `화학 교과 세특
학생은 배터리 열화 메커니즘을 자료로 구조화하고 위험 요인을 근거와 함께 정리하였다. 안전 체크리스트를 제작·공유하며 화학 개념과 공학적 안전을 연결하였다.`,
    performanceText: `문헌–비교–안전수칙–한계`,
    tags: ["에너지", "안전", "문헌조사"],
  },
  {
    id: "peer-tutor",
    track: "edu",
    subject: "수학",
    title: "또래 튜터링 전후 오답 유형 변화 분석",
    preview: "튜터링 전후 오답 유형을 분류하고 설명 전략을 개선한 교육·수학 탐구…",
    fullText: `수학 교과 세특
학생은 또래 튜터링을 설계하고 오답 유형을 분류하였다. 설명 방식을 바꾼 뒤 변화를 기록하며 교수·학습과 메타인지를 연결하였다.`,
    performanceText: `사전–중재–사후–성찰`,
    tags: ["교육", "튜터링", "오답분석"],
  },
  {
    id: "poster-ux",
    track: "design",
    subject: "미술",
    title: "정보 전달형 포스터 A/B 시안 사용성 비교",
    preview: "두 시안을 제작해 가독성·행동을 비교한 디자인 리서치…",
    fullText: `미술·디자인 세특
학생은 정보 위계와 색 대비를 달리한 시안을 제작하고 짧은 사용성 테스트로 선호·이해도를 비교하였다. 시각 언어와 설득 목적의 연결을 보여 주었다.`,
    performanceText: `리서치–시안–테스트–개선`,
    tags: ["디자인", "사용성", "시각언어"],
  },
  {
    id: "robot-line",
    track: "eng",
    subject: "정보",
    title: "라인트레이서 로봇의 제어 파라미터 최적화",
    preview: "속도·임계값을 바꾸며 완주율을 비교한 제어·공학 탐구…",
    fullText: `정보·공학 세특
학생은 제어 파라미터를 독립변인으로 두고 완주율·시간을 측정하였다. 최적 구간과 과적합(특정 코스만 잘함) 한계를 논의하였다.`,
    performanceText: `파라미터표–실험–최적–한계`,
    tags: ["로봇", "제어", "최적화"],
  },
  {
    id: "vaccine-lit",
    track: "med",
    subject: "생명과학",
    title: "백신·면역 관련 오정보 팩트체크 리포트",
    preview: "공개 자료를 근거로 오정보를 검증하고 카드뉴스로 공유한 보건 리터러시 탐구…",
    fullText: `생명과학 교과 세특
학생은 면역 개념을 정리한 뒤 유포 오정보를 근거 자료로 검증하고 학급에 공유하였다. 과학적 근거와 소통 윤리를 함께 고려하였다.`,
    performanceText: null,
    tags: ["면역", "팩트체크", "보건"],
  },
  {
    id: "fx-sim",
    track: "econ",
    subject: "경제",
    title: "환율 변동이 수입 물가에 미치는 영향 시뮬레이션",
    preview: "가상 시나리오로 환율–물가 연쇄를 표로 정리한 경제 모형 탐구…",
    fullText: `경제 교과 세특
학생은 환율 충격 시나리오를 가정하고 수입 단가·소비자 가격에 대한 파급을 표로 시뮬레이션하였다. 가정과 한계를 명시하며 거시 개념을 적용하였다.`,
    performanceText: `시나리오–표–해석–한계`,
    tags: ["환율", "거시", "시뮬레이션"],
  },
  {
    id: "urban-walk",
    track: "soc",
    subject: "한국사",
    title: "지역 역사 공간 답사와 기록 아카이빙",
    preview: "답사·사진·인터뷰로 지역사를 아카이빙하고 전시 카드로 공유한 탐구…",
    fullText: `한국사 교과 세특
학생은 지역 역사 공간을 답사하고 사료를 분류·캡션화하였다. 구술 인터뷰(동의 확보)를 보완하며 공공 기억과 기록의 의미를 성찰하였다.`,
    performanceText: null,
    tags: ["답사", "아카이브", "지역사"],
  },
];

/** 학교/학과 별칭 매칭 */
export function normalizeSearchToken(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export function matchUniversity(input: string): string[] {
  const n = normalizeSearchToken(input);
  if (!n) return [];
  return UNIVERSITIES.filter((u) => normalizeSearchToken(u).includes(n) || n.includes(normalizeSearchToken(u).slice(0, 2)));
}

export function matchMajors(input: string): typeof MAJORS {
  const n = normalizeSearchToken(input);
  if (!n) return [];
  return MAJORS.filter((m) => {
    if (normalizeSearchToken(m.name).includes(n) || n.includes(normalizeSearchToken(m.name)))
      return true;
    return m.aliases.some((a) => n.includes(normalizeSearchToken(a)) || normalizeSearchToken(a).includes(n));
  });
}

export function trackForMajorName(major: string): MajorTrack | null {
  const hits = matchMajors(major);
  return hits[0]?.track ?? null;
}
