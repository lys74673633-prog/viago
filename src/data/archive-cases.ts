import type { ArchiveCaseListItem } from "@/types/archive";
import {
  ACTIVITY_TEMPLATES,
  MAJORS,
  UNIVERSITIES,
  matchMajors,
  matchUniversity,
  normalizeSearchToken,
  trackForMajorName,
  type MajorTrack,
} from "@/data/archive-catalog";

export type ArchiveCaseSeed = Omit<ArchiveCaseListItem, "fullText" | "performanceText" | "locked"> & {
  fullText: string;
  performanceText: string | null;
};

/** 손수 작성한 대표 사례 */
const HANDCRAFTED: ArchiveCaseSeed[] = [
  {
    id: "seed-snu-cse-2024",
    slug: "snu-cse-2024-data-campaign",
    university: "서울대학교",
    major: "컴퓨터공학부",
    admissionYear: 2024,
    subject: "정보",
    title: "급식 잔반 데이터의 수집·정제·시각화와 행동 유도 캠페인 설계",
    preview:
      "정보 수업에서 교내 급식 잔반량을 4주간 직접 계측·기록하고, 파이썬으로 요일·메뉴별 패턴을 시각화한 뒤 학급 캠페인으로 확장하였다…",
    tags: ["데이터분석", "파이썬", "공공문제", "시각화"],
    fullText: `정보 교과 세특
학생은 ‘교내 급식 잔반 감소’를 문제로 설정하고, 4주간 잔반량을 저울·사진·메뉴표와 함께 기록하는 데이터 수집 프로토콜을 스스로 설계하였다. 결측치와 이상치(행사일, 급식 중단일)를 제외하는 전처리 규칙을 문서화한 뒤, 파이썬(pandas, matplotlib)으로 요일·메뉴 카테고리별 평균 잔반량을 비교 시각화하였다. 분석 결과 ‘튀김류·면류가 많은 요일’에 잔반이 유의미하게 증가한다는 패턴을 근거와 함께 제시하였으며, 단순 구호가 아닌 데이터 기반 행동 유도 문구와 게시물을 제작하여 학급 캠페인에 적용하였다. 캠페인 전후 1주 잔반량을 재측정하여 변화 폭을 수치로 보고하였고, 표본 기간이 짧아 일반화에 한계가 있음을 스스로 언급하며 후속 탐구 과제로 표본 확대와 A/B 메시지 실험을 제안하였다. 문제 정의–수집–정제–분석–소통–검증의 전 과정을 주도적으로 수행하며 데이터 기반 의사결정과 공공성 있는 문제 해결 역량을 심화하였다.`,
    performanceText: `수행평가 연계 요약
탐구 질문: 요일·메뉴 특성이 잔반량에 어떤 영향을 미치는가?
방법: 4주 계측, 전처리 규칙 문서화, 시각화, 캠페인 적용 후 재측정
성과: 패턴 도출 및 행동 유도 캠페인 설계, 한계와 후속 연구 명시`,
  },
  {
    id: "seed-yonsei-bio-2023",
    slug: "yonsei-bio-2023-microplastic",
    university: "연세대학교",
    major: "생명공학과",
    admissionYear: 2023,
    subject: "생명과학",
    title: "미세플라스틱 농도에 따른 담수 플랑크톤 생존율 비교 실험",
    preview:
      "생명과학 탐구에서 미세플라스틱 농도 조건을 나누어 담수 플랑크톤 생존율을 비교하고, 변인 통제와 오차 요인을 체계적으로 검토하였다…",
    tags: ["실험설계", "환경", "생태", "변인통제"],
    fullText: `생명과학 교과 세특
학생은 미세플라스틱이 담수 생태계에 미치는 영향을 주제로, 농도(대조군·저농도·고농도)에 따른 플랑크톤 생존율을 비교하는 실험을 설계하였다. 독립변인·종속변인·통제변인을 명확히 구분하고, 온도·광량·먹이 공급을 일정하게 유지하는 절차를 실험 노트에 기록하였다. 반복 측정(각 조건 3회) 후 평균과 편차를 정리하고, 그래프로 경향을 제시하였으며, 현미경 관찰에서 나타난 행동 변화(유영성 저하)를 정성 자료로 보완하였다. 결과 해석 과정에서 실험실 환경과 자연 수계의 차이를 한계로 명시하고, 농도 구간을 더 세분화하는 후속 실험을 제안하였다. 환경·보건 이슈를 생명과학 개념(생태, 독성, 변인 통제)과 연결하며 탐구의 깊이와 진로 탐색의 구체성을 동시에 보여 주었다.`,
    performanceText: `수행평가 보고서 요지
가설: 미세플라스틱 농도 증가 시 생존율이 감소한다
데이터: 조건별 반복 측정, 평균·편차, 관찰 기록
결론: 경향은 확인되었으나 현장 외삽에는 주의 필요`,
  },
  {
    id: "seed-korea-econ-2024",
    slug: "korea-econ-2024-pb-pricing",
    university: "고려대학교",
    major: "경제학과",
    admissionYear: 2024,
    subject: "경제",
    title: "편의점 PB·NB 상품 가격 전략과 소비자 선택 요인 조사",
    preview:
      "경제 수업과 연계해 인근 편의점 PB/NB 가격을 조사하고, 설문으로 가격 탄력성과 브랜드 효과를 검토하였다…",
    tags: ["조사", "가격탄력성", "소비자", "비판적사고"],
    fullText: `경제 교과 세특
학생은 동일 카테고리 내 PB(자체브랜드)와 NB(제조사브랜드)의 가격 차이를 매장 관찰로 수집하고, 단위 가격·프로모션 여부를 표로 정리하였다. 교내 학생 42명을 대상으로 선택 요인을 묻는 간이 설문을 실시하고, 교차표를 통해 ‘가격 민감 집단’과 ‘브랜드 선호 집단’의 차이를 비교하였다. 수요의 가격탄력성 개념을 실제 선택 상황에 적용하려 시도하였고, 편의표본이라는 표집 한계와 설문 문항의 편향 가능성을 스스로 지적하였다. 일상 속 가격 전략을 경제 모형으로 설명하고, 해석의 신중함을 유지하며 사회과학적 탐구 태도를 보여 주었다.`,
    performanceText: null,
  },
];

function templatesForTrack(track: MajorTrack | null) {
  if (!track) return ACTIVITY_TEMPLATES;
  const primary = ACTIVITY_TEMPLATES.filter((t) => t.track === track || t.track === "any");
  const secondary = ACTIVITY_TEMPLATES.filter((t) => t.track !== track);
  return [...primary, ...secondary];
}

function buildGeneratedSeeds(): ArchiveCaseSeed[] {
  const out: ArchiveCaseSeed[] = [];

  // 모든 대학 × 주요 전공에 템플릿을 붙여 검색 시 풍부한 관련 자료가 나오게 함
  UNIVERSITIES.forEach((university, ui) => {
    MAJORS.forEach((major, mi) => {
      const templates = templatesForTrack(major.track).slice(0, 2);
      templates.forEach((tpl, ti) => {
        const year = 2022 + ((ui + mi + ti) % 3);
        const slug = `${normalizeSearchToken(university).slice(0, 8)}-${normalizeSearchToken(major.name).slice(0, 8)}-${tpl.id}-${ti}`;
        out.push({
          id: `gen-${slug}`,
          slug,
          university,
          major: major.name,
          admissionYear: year,
          subject: tpl.subject,
          title: `${tpl.title} — ${major.name} 진로 연계`,
          preview: `${university} ${major.name} 합격 사례(익명·합성). ${tpl.preview}`,
          tags: [...tpl.tags, major.aliases[0] ?? major.name, university.replace("대학교", "")],
          fullText: `${tpl.fullText}

[진로 연계]
학생은 위 탐구를 ‘${major.name}’ 전공 적합성의 근거로 연결하며, ${university} 지원 동기와 후속 학습 계획을 구체화하였다. 활동의 단순 나열이 아니라 전공에서 요구되는 문제 해결·분석·소통 역량으로 재해석하였다.`,
          performanceText: tpl.performanceText
            ? `${tpl.performanceText}\n전공 키워드: ${major.name}`
            : `전공 연계 요약: ${major.name}에 필요한 탐구·분석 역량을 활동으로 증명`,
        });
      });
    });
  });

  return out;
}

const GENERATED = buildGeneratedSeeds();

export const ARCHIVE_CASE_SEEDS: ArchiveCaseSeed[] = [...HANDCRAFTED, ...GENERATED];

export type ArchiveSearchParams = {
  q?: string;
  university?: string;
  major?: string;
  limit?: number;
};

function scoreItem(
  item: ArchiveCaseSeed,
  university: string,
  major: string,
  q: string,
): number {
  let score = 0;
  const uniN = normalizeSearchToken(university);
  const majorN = normalizeSearchToken(major);
  const qN = q.trim().toLowerCase();

  const itemUni = normalizeSearchToken(item.university);
  const itemMajor = normalizeSearchToken(item.major);
  const hay = [item.title, item.university, item.major, item.subject, ...item.tags, item.preview]
    .join(" ")
    .toLowerCase();

  const wantTrack = majorN ? trackForMajorName(major) : null;
  const itemTrack = trackForMajorName(item.major);
  const majors = majorN ? matchMajors(major) : [];
  const uniMatched = Boolean(
    uniN &&
      (itemUni.includes(uniN) ||
        uniN.includes(itemUni) ||
        matchUniversity(university).some((u) => normalizeSearchToken(u) === itemUni)),
  );
  const majorExact =
    Boolean(majorN) &&
    (itemMajor.includes(majorN) ||
      majorN.includes(itemMajor) ||
      majors.some((m) => normalizeSearchToken(m.name) === itemMajor));
  const sameTrack = Boolean(wantTrack && itemTrack && wantTrack === itemTrack);

  // 학과/계열 일치가 최우선 → 그다음 학교
  if (majorExact) score += 80;
  else if (sameTrack) score += 55;
  else if (majorN && majors.some((m) => m.aliases.some((a) => hay.includes(a.toLowerCase()))))
    score += 28;

  if (uniMatched) {
    score += sameTrack || majorExact || !majorN ? 40 : 12;
  } else if (uniN && hay.includes(uniN)) {
    score += 8;
  }

  if (qN) {
    for (const token of qN.split(/[\s,/]+/).filter((t) => t.length >= 2)) {
      if (hay.includes(token)) score += 8;
    }
  }

  if (item.id.startsWith("seed-")) score += 6;

  // 학교만 넣고 학과가 없으면 해당 학교 사례 전부, 학과만 있으면 계열 전체
  if (!majorN && !uniN && !qN) return 1;
  return score;
}

/**
 * 학교·학과·키워드로 관련 사례를 많이 반환 (관련 전공 트랙 포함)
 */
export function searchArchiveSeeds(params: ArchiveSearchParams | string = {}) {
  const p: ArchiveSearchParams =
    typeof params === "string" ? { q: params } : params ?? {};
  const university = (p.university ?? "").trim();
  const major = (p.major ?? "").trim();
  const q = (p.q ?? "").trim();
  const limit = p.limit ?? 60;

  const hasFilter = Boolean(university || major || q);
  if (!hasFilter) {
    return ARCHIVE_CASE_SEEDS.slice(0, limit);
  }

  const scored = ARCHIVE_CASE_SEEDS.map((item) => ({
    item,
    score: scoreItem(item, university, major, q),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // 결과가 적으면 같은 트랙만이라도 더 채움
  if (scored.length < 12 && major) {
    const track = trackForMajorName(major);
    if (track) {
      const extras = ARCHIVE_CASE_SEEDS.filter(
        (item) =>
          trackForMajorName(item.major) === track &&
          !scored.some((s) => s.item.id === item.id),
      ).map((item) => ({ item, score: 10 }));
      scored.push(...extras);
    }
  }

  if (scored.length < 8 && university) {
    const extras = ARCHIVE_CASE_SEEDS.filter(
      (item) =>
        normalizeSearchToken(item.university).includes(normalizeSearchToken(university).slice(0, 2)) &&
        !scored.some((s) => s.item.id === item.id),
    ).map((item) => ({ item, score: 8 }));
    scored.push(...extras);
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

export function archiveFacetSuggestions() {
  return {
    universities: [...UNIVERSITIES],
    majors: MAJORS.map((m) => m.name),
  };
}
