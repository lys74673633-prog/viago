import type {
  PerformanceExpandResult,
  PerformanceTopicInput,
  RecommendedTopic,
} from "@/types";

export function buildDemoTopics(input: PerformanceTopicInput): RecommendedTopic[] {
  const { unit, keywords } = input;
  return [
    {
      id: "demo-1",
      title: `${keywords}로 본 ${unit} 핵심 개념 검증`,
      hook: "교과서 개념을 일상·실험·조사 데이터로 확인하는 탐구",
      angle: "변인 통제와 한계 명시를 강조",
    },
    {
      id: "demo-2",
      title: `${unit} 속 ${keywords} 사례 비교 분석`,
      hook: "두 가지 이상의 사례를 기준표로 비교",
      angle: "평가 루브릭·근거 제시 중심",
    },
    {
      id: "demo-3",
      title: `${keywords} 문제 해결을 위한 ${unit} 적용 프로젝트`,
      hook: "문제 정의–방법–결과–성찰의 프로젝트형 보고서",
      angle: "실행 과정과 협력 역할 서술",
    },
  ];
}

export function buildDemoExpand(
  input: PerformanceTopicInput,
  selectedTopic: string,
): PerformanceExpandResult {
  const { unit, keywords } = input;
  const reportDraft = `서론
본 보고서는 ‘${selectedTopic}’를 주제로, ${unit} 단원의 핵심 개념과 ‘${keywords}’를 연결하여 탐구한 과정을 정리한다. 연구 질문은 “${keywords}가 ${unit} 학습 맥락에서 어떻게 설명·검증될 수 있는가?”이다.

이론적 배경
${unit}에서 다루는 주요 개념을 정리하고, ${keywords}와 직접 연결되는 용어·원리를 선별하였다. 선행 자료(교과서, 공공기관 자료, 개론서)를 비교하여 공통적으로 강조되는 설명 틀을 도출하였다.

연구 방법
1) 자료 수집: 관찰·측정·설문·문헌 중 주제에 적합한 방법을 선택
2) 분석: 표·그래프 또는 사례 비교표로 정리
3) 한계: 표본, 측정 오차, 주관 해석 가능성을 명시

결과 및 논의
수집한 자료를 바탕으로 ${keywords}와 관련된 경향·차이를 제시하였다. 결과는 가설을 부분적으로 지지하였으며, 예외 사례와 교란 변수를 함께 검토하였다. ${unit} 개념을 결과 해석에 재적용함으로써 단순 나열이 아닌 이론–증거 연결을 시도하였다.

결론
본 탐구를 통해 ${selectedTopic}에 대한 이해를 구체화하였고, 후속 과제로는 표본 확대, 측정 도구 정교화, 비교군 추가를 제안한다. 수행평가 과정에서 문제 정의–방법–해석–성찰의 사이클을 스스로 완결한 점이 학습 성과이다.

(본 문서는 API 키 미설정 시 제공되는 데모 초안이며, OpenAI/Gemini 키를 연결하면 더 긴 맞춤 보고서가 생성됩니다.)`;

  const speechScript = `발표 대본 (약 3분)
안녕하세요. 오늘은 ‘${selectedTopic}’에 대해 발표하겠습니다.
먼저 탐구 동기는 ${unit} 수업에서 ${keywords}에 관심을 갖게 된 점입니다.
방법에서는 자료를 모아 표로 정리했고, 결과에서는 경향과 한계를 함께 말씀드리겠습니다.
마지막으로, 이 탐구가 ${unit} 개념 이해와 문제 해결에 어떻게 도움이 되었는지 정리하며 마치겠습니다. 경청해 주셔서 감사합니다.`;

  return {
    topicTitle: selectedTopic,
    reportDraft,
    speechScript,
    references: [
      {
        id: "r1",
        citation: `교육부. (n.d.). ${unit} 관련 교육과정 자료. 대한민국 교육부.`,
        sourceType: "정부/교육과정",
      },
      {
        id: "r2",
        citation: `교과서 집필진. (n.d.). ${unit} 단원 개요. 고등학교 교과서.`,
        sourceType: "교과서",
      },
      {
        id: "r3",
        citation: `Viago Demo. (2026). ${keywords} 탐구 가이드 (데모).`,
        sourceType: "기타",
      },
    ],
  };
}
