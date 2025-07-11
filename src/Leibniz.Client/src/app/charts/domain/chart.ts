import { RefItem } from '../../common/domain/ref-item';

export interface Chart {
  chartId: number;
  name: string | null;
  content: string | null;
  refs: RefItem[] | null;
}
