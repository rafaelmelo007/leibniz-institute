export interface Book {
  bookId: number | null;
  title: string | null;
  author: string | null;
  publisher: string | null;
  edition: number | null;
  content: string | null;
  year: number | null;
  totalOfPages: number | null;
  translator: string | null;
  isbn: string | null;
  price: number | null;
  purchasedDate: Date | null;
  sizeX: number | null;
  sizeY: number | null;
  sizeZ: number | null;
  local: string | null;
}
