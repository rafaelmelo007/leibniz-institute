export interface Period {
  periodId: number;
  name: string;
  content: string;
  beginYear?: number;
  endYear?: number;
  beginMonth?: number;
  endMonth?: number;
  beginDay?: number;
  endDay?: number;
  imageFileName?: string | null;
}
