import { RefItem } from '../../common/domain/ref-item';

export interface Post {
  postId: number;
  title: string;
  content: string;
  author: string;
  bookId: number | null;
  bookName?: string | null;
  page: number | null;
  reference: string | null;
  refs: RefItem[] | null;
  imageFileName?: string | null;
}
