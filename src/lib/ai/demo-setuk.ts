import type { SetukInput, SetukVersion } from "@/types";

/** API 키 없을 때 쓰는 상용 데모 세특 (입력값 반영) */
export function buildDemoSetukVersions(input: SetukInput): SetukVersion[] {
  const { subject, keywords, roleAndReflection } = input;

  const academic = `${subject} 교과 세특
학생은 ‘${keywords}’를 핵심 탐구 주제로 설정하고, 관련 개념을 교과서·참고 자료와 연결하여 스스로 문제 정의를 구체화하였다. ${roleAndReflection} 과정에서 관찰·기록·정리를 반복하며 자료를 구조화하였고, 단순 요약에 그치지 않고 원인–결과·비교–대조의 틀로 해석을 시도하였다. 탐구 중 발견한 한계(표본·측정·주관성)를 명시하고 개선 방향을 제안하는 등 비판적 사고와 학문적 태도를 보여 주었다. 교과 개념을 실제 맥락에 적용하며 ${subject} 학습의 깊이와 탐구 지속성을 동시에 신장하였다.`;

  const career = `${subject} 교과 세특
학생은 ‘${keywords}’ 활동을 자신의 관심 분야·진로 탐색과 연결하여 의미를 재구성하였다. ${roleAndReflection}을 바탕으로 활동에서 요구된 역량(분석, 설계, 소통 등)이 어떤 진로 장면과 닿는지 구체적으로 서술하였으며, 관련 직업·전공에서 쓰이는 문제 해결 방식과 비교해 보았다. 관심사에 머무르지 않고 후속 학습 과제와 체험·탐구 계획을 제시하여 진로 탐색의 실행력을 드러내었다. ${subject} 학습이 진로 역량으로 이어지는 연결고리를 스스로 설계한 점이 돋보인다.`;

  const community = `${subject} 교과 세특
학생은 ‘${keywords}’ 관련 활동에서 ${roleAndReflection}을 통해 협력과 역할 분담의 중요성을 체득하였다. 팀 내에서 의견을 조율하고 과제를 나누며, 갈등이 있을 때 근거를 들어 합의를 이끌어 가려 노력하였다. 활동 성과를 학급·동아리 등 공동체와 공유하는 방식을 고민하였고, 공공성·배려·책임감을 활동 평가 기준으로 스스로 점검하였다. ${subject} 학습을 개인 성취에 한정하지 않고 공동체의 문제 해결로 확장하려는 태도를 보여 주었다.`;

  return [
    {
      type: "academic",
      label: "학업 역량",
      description: "탐구·분석·개념 이해 중심",
      content: academic,
    },
    {
      type: "career",
      label: "진로 역량",
      description: "관심 분야·진로 연결 중심",
      content: career,
    },
    {
      type: "community",
      label: "공동체 역량",
      description: "협력·소통·기여 중심",
      content: community,
    },
  ];
}
