import Link from "next/link";
export default function NotFound() {
  return (
    <section className="empty-state">
      <h1>পৃষ্ঠা পাওয়া যায়নি</h1>
      <p>সূরার নম্বর ১ থেকে ১১৪-এর মধ্যে দিন।</p>
      <Link href="/">সূরার তালিকায় ফিরুন →</Link>
    </section>
  );
}
