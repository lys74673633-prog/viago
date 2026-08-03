/** 내신·모의 등급 체계 (2009년생~ 고교는 5등급제 전환 흐름) */
export type GradeScale = "5" | "9";

export const GRADE_SCALE_LABEL: Record<GradeScale, string> = {
  "5": "5등급제",
  "9": "9등급제",
};

/**
 * 입력 등급을 내부 비교용 9등급 스케일로 변환 (참고용 근사).
 * 5등급 1→1.0, 2→3.0, 3→5.0, 4→7.0, 5→9.0
 */
export function toNineScale(grade: number, scale: GradeScale): number {
  if (scale === "9") return Math.min(9, Math.max(1, grade));
  const g = Math.min(5, Math.max(1, grade));
  return +(1 + (g - 1) * 2).toFixed(2);
}

/** 9등급 값을 표시용 스케일로 되돌림 */
export function fromNineScale(nine: number, scale: GradeScale): number {
  if (scale === "9") return +Math.min(9, Math.max(1, nine)).toFixed(2);
  const n = Math.min(9, Math.max(1, nine));
  return +(1 + (n - 1) / 2).toFixed(2);
}

export function scaleMax(scale: GradeScale): number {
  return scale === "5" ? 5 : 9;
}

export function clampToScale(grade: number, scale: GradeScale): number {
  const max = scaleMax(scale);
  return Math.min(max, Math.max(1, grade || (scale === "5" ? 3 : 5)));
}

export const GUIDE_5 = {
  title: "5등급제 기준 자료 안내",
  subtitle: "2009년생 이후 고교 과정(성취·5등급 체계) 참고",
  bullets: [
    "2009년생부터 적용되는 고교 학사·평가 개편에 따라, 기존 9등급 상대평가 중심 체계와 다른 5등급(성취·등급) 기준으로 성적·진단을 읽는 경우가 많습니다.",
    "Viago 진단에서는 5등급제 선택 시 입력값을 5등급 스케일로 해석하고, 대학 밴드 비교를 위해 내부적으로 9등급 근사값으로 환산합니다.",
    "대략 환산(참고): 5등급 1≈9등급 1~2대, 2≈3~4대, 3≈5대, 4≈6~7대, 5≈8~9대.",
    "모의고사·내신·대학별 발표 지표가 혼재할 수 있으니, 학교생활기록부·모의 성적표에 적힌 ‘등급 체계’를 먼저 확인하세요.",
    "본 안내는 교육 참고용이며 교육부·평가원·대학 공식 발표를 대체하지 않습니다.",
  ],
  table: [
    { five: "1등급", nine: "9등급제 1~2등급대", meaning: "최상위" },
    { five: "2등급", nine: "9등급제 3~4등급대", meaning: "상위" },
    { five: "3등급", nine: "9등급제 5등급대", meaning: "중상위" },
    { five: "4등급", nine: "9등급제 6~7등급대", meaning: "중위" },
    { five: "5등급", nine: "9등급제 8~9등급대", meaning: "보완 필요" },
  ],
};

export const GUIDE_9 = {
  title: "9등급제 기준 자료 안내",
  subtitle: "기존 상대평가 9등급(누적 비율) 체계 참고",
  bullets: [
    "전통적인 고교·모의고사 상대평가에서 쓰이던 1~9등급 체계입니다. (숫자가 작을수록 상위)",
    "대략적 비율 감각(참고): 1등급 상위 4%, 2등급 11%, 3등급 23%, 4등급 40%, 5등급 60%, 6등급 77%, 7등급 89%, 8등급 96%, 9등급 100% 누적에 가까운 구조로 이해합니다.",
    "Viago의 대학·학과 지원 가능군 표는 기본적으로 이 9등급 감각을 기준으로 잡혀 있으며, 5등급제 입력 시 환산 후 같은 표를 적용합니다.",
    "동일 ‘2등급’이라도 5등급제와 9등급제의 의미가 다르므로, 반드시 위에서 체계를 선택한 뒤 입력하세요.",
    "본 안내는 교육 참고용이며 공식 입시 요강을 대체하지 않습니다.",
  ],
  table: [
    { five: "1", nine: "최상위(~4%)", meaning: "최상위권" },
    { five: "2", nine: "상위(~11%)", meaning: "상위권" },
    { five: "3", nine: "중상위(~23%)", meaning: "중상위" },
    { five: "4", nine: "중위(~40%)", meaning: "중위" },
    { five: "5", nine: "중위(~60%)", meaning: "중위" },
    { five: "6~7", nine: "중하위", meaning: "보완·전략 병행" },
    { five: "8~9", nine: "하위", meaning: "기초·전형 재설계" },
  ],
};
