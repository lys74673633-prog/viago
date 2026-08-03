export interface ArchiveCaseListItem {
  id: string;
  slug: string;
  university: string;
  major: string;
  admissionYear: number;
  subject: string;
  title: string;
  preview: string;
  tags: string[];
  /** 프리미엄/권한 있을 때만 채워짐 */
  fullText: string | null;
  performanceText: string | null;
  locked: boolean;
}
