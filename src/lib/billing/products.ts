export type ProductId =
  | "premium_monthly"
  | "export_once"
  | "clean_token_pack"
  | "parent_report";

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  priceKrw: number;
  badge?: string;
}

export const PRODUCTS: Record<ProductId, Product> = {
  premium_monthly: {
    id: "premium_monthly",
    name: "Viago 프리미엄 (월간)",
    description: "문서 변환·클리닝·합격 생기부·학부모 리포트 포함",
    priceKrw: 12900,
    badge: "추천",
  },
  export_once: {
    id: "export_once",
    name: "HWP/PDF 단건 다운로드",
    description: "학교 제출용 문서 1회 변환·다운로드",
    priceKrw: 1900,
  },
  clean_token_pack: {
    id: "clean_token_pack",
    name: "AI 클리닝 토큰 5회",
    description: "표절 방지·안심 클리닝 애드온",
    priceKrw: 2900,
  },
  parent_report: {
    id: "parent_report",
    name: "학부모 입시 진단 리포트",
    description: "모의고사·생기부 기반 대입 가능성 PDF",
    priceKrw: 9900,
  },
};

export const CLEAN_COST = 1;
export const CLEAN_PACK_TOKENS = 5;
export const PREMIUM_CLEAN_MONTHLY_ALLOWANCE = 30;
