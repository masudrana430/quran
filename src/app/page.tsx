import QuranDirectory from "@/components/QuranDirectory";
import { directory, searchIndex, contentProgress } from "@/lib/quran";
export default function HomePage() {
  return (
    <QuranDirectory
      chapters={directory}
      verses={searchIndex}
      completed={contentProgress.completedCount}
    />
  );
}
