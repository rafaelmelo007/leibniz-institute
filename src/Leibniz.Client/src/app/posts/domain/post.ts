export interface Post {
  postId: number;
  title: string;
  content: string;
  author: string;
  bookId: number | null;
  page: number | null;
  reference: string | null;
}