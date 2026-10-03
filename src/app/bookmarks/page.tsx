import BookmarkList from "@/components/BookmarkList";
import { searchIndex } from "@/lib/quran";
export default function BookmarksPage() {
  return <BookmarkList verses={searchIndex} />;
}
