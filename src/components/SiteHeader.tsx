import Link from "next/link";
export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden="true">
          ق
        </span>
        <span>
          কুরআন<span className="brand-sub">পড়ুন · বুঝুন · মনে রাখুন</span>
        </span>
      </Link>
      <nav aria-label="প্রধান নেভিগেশন">
        <Link href="/">সূরা</Link>
        <Link href="/bookmarks">সংরক্ষিত</Link>
        <Link href="/about">উৎস ও পদ্ধতি</Link>
      </nav>
    </header>
  );
}
