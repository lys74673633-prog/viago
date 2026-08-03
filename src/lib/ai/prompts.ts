import type { PerformanceTopicInput, SetukInput } from "@/types";

export function buildSetukPrompt(input: SetukInput): string {
  return `당신은 대한민국 고등학교 생활기록부 ‘세부능력 및 특기사항(세특)’ 작성 전문가이자 학생부종합전형 평가 관점을 이해하는 교사입니다.

목표: 입력된 활동을 바탕으로 평가자가 읽었을 때 구체성·과정·성장이 드러나는 세특 문장을 작성합니다.

작성 규칙:
1) 각 버전 3~5문장, 총 350~550자 수준(한글 기준)으로 충분히 서술합니다.
2) 학교생활기록부 문체: 과거형, 객관적 서술, 과장·허위·과도한 미사여구 금지.
3) 반드시 포함할 요소: 활동 맥락, 학생의 구체적 역할/행동, 탐구·협력 과정, 결과 또는 배움, 역량으로의 연결.
4) 상투어(“열심히”, “다양한”, “뛰어난”) 남용 금지. 관찰 가능한 행동 중심으로 씁니다.

[과목] ${input.subject}
[활동 키워드] ${input.keywords}
[역할 및 느낀 점] ${input.roleAndReflection}

JSON만 출력:
{
  "academic": "학업 역량(지식·탐구·분석) 중심 세특",
  "career": "진로 역량(관심·연계·진로탐색) 중심 세특",
  "community": "공동체 역량(협력·소통·배려·기여) 중심 세특"
}`;
}

export function buildPerformanceTopicsPrompt(input: PerformanceTopicInput): string {
  return `당신은 대한민국 고등학생 수행평가·탐구보고서 주제 기획 전문가입니다.
최신 사회·과학 이슈와 교과 성취기준을 연결한, 구체적이고 실행 가능한 주제 5개를 제안하세요.
각 주제는 2~3주 내 조사/실험/발표가 가능해야 하며, 너무 넓거나 추상적이면 안 됩니다.

[교과 단원] ${input.unit}
[궁금한 주제 키워드] ${input.keywords}

JSON만 출력:
{
  "topics": [
    {
      "id": "t1",
      "title": "구체적 주제명(연구 질문형이어도 됨)",
      "hook": "시의성·흥미 한 문장",
      "angle": "탐구 방법/각도 한 문장"
    }
  ]
}
topics는 정확히 5개.`;
}

export function buildPerformanceExpandPrompt(
  input: PerformanceTopicInput & { selectedTopic: string },
): string {
  return `당신은 고등학교 수행평가(탐구보고서·실험보고서) 지도 경험이 풍부한 교사입니다.
학생이 학교에 제출할 수 있는 **롱폼 보고서 초안**과 **3분 발표 대본**, **APA 7th 참고문헌**을 작성하세요.

보고서(reportDraft) 필수 요구사항:
- 분량: 한글 기준 1,800~2,800자 이상 (짧으면 실패로 간주)
- 구조(마크다운 제목 사용):
  # 제목
  ## 1. 서론 (탐구 배경, 문제 인식, 연구 질문/목적)
  ## 2. 이론적 배경 (교과 개념 2개 이상 정확히 설명)
  ## 3. 탐구 방법 (대상/자료/절차/변인 또는 분석 틀)
  ## 4. 결과 및 해석 (표·그래프를 가정한 서술, 패턴/의미)
  ## 5. 결론 및 제언 (요약, 한계, 후속 탐구, 일상/사회 적용)
- 구체적 탐구 과정이 드러나야 함 (무엇을 어떻게 했는지)
- 표절성 상투문 금지. 학생이 보완할 여지를 남기되 뼈대는 완성도 높게.
- 허위 실험 수치·가짜 DOI·존재하지 않는 논문 제목 금지. 수치는 “예시/가정”임을 밝히거나  qualitatively 서술.

발표 대본(speechScript):
- 3분 분량(약 450~650자), 구어체, 서론-본론-마무리.

참고문헌(references):
- 3~5개, APA 7th. 교육부/통계청/교과서/유명 기관 보고서 등 실재 가능한 출처. 가짜 DOI 금지.

[교과 단원] ${input.unit}
[키워드] ${input.keywords}
[선택 주제] ${input.selectedTopic}

JSON만 출력:
{
  "topicTitle": "선택 주제명",
  "reportDraft": "롱폼 보고서 전체(마크다운)",
  "speechScript": "3분 발표 대본",
  "references": [
    { "id": "r1", "citation": "APA 한 줄", "sourceType": "journal|report|book|web" }
  ]
}`;
}

export function buildCleanPrompt(text: string): string {
  return `다음 문장을 학교 나이스(NEIS)·웹상 상투적 문구와 겹치지 않도록 독창적 어조로 다시 쓰세요.
의미·사실관계는 유지하고 과장·허위는 금지합니다. 생기부/보고서 문체를 유지하세요.
분량은 원문과 비슷하거나 약간 더 구체화합니다.

원문:
${text}

JSON: { "cleaned": "다듬은 문장" }`;
}
