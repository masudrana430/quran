import { contentProgress } from "@/lib/quran";
export default function AboutPage() {
  return (
    <article className="about-page">
      <p className="eyebrow">উৎস ও শেখার পদ্ধতি</p>
      <h1>পাঠের উৎস জানুন</h1>
      <p>
        এই ওয়েবসাইটে আরবি আয়াত ও শব্দ, বাংলা শব্দার্থ এবং ট্রান্সলিটারেশন
        Quran.com / Quran Foundation-এর API থেকে নেওয়া হয়েছে।
      </p>
      <h2>বাংলা অনুবাদ</h2>
      <p>
        ড. আবু বকর মুহাম্মাদ যাকারিয়া — Quran.com resource 213। মূল অনুবাদ
        সংরক্ষিত রাখা হয়; পর্দায় HTML চিহ্ন বাদ দিয়ে নিরাপদ সাধারণ লেখা দেখানো
        হয়। মূল অনুবাদ ও টীকা মিলিয়ে পড়তে{" "}
        <a href="https://quran.com" target="_blank" rel="noreferrer">
          Quran.com
        </a>{" "}
        দেখুন। শব্দে শব্দে অর্থ পূর্ণ আয়াতের অনুবাদের বিকল্প নয়।
      </p>
      <h2>অডিও</h2>
      <p>
        Mishary Rashid Alafasy-এর তিলাওয়াত, Quran.com recitation 7। অডিও বাইরের
        সার্ভার থেকে চলে; ইন্টারনেট প্রয়োজন।
      </p>
      <h2>মনে রাখার কৌশল</h2>
      <p>
        বাংলা, উর্দু ও হিন্দির পরিচিত শব্দের সঙ্গে নির্ভরযোগ্য মিল, একই আরবি
        শব্দের বিভিন্ন রূপ এবং আয়াতের শব্দজোড়া দিয়ে সম্পর্ক তৈরি করা হয়। ধ্বনির
        মিলকে শব্দের উৎপত্তি বলা হয় না। আরবি শব্দের রূপ ও পরিবার যাচাইয়ের উৎস:{" "}
        <a href="https://corpus.quran.com" target="_blank" rel="noreferrer">
          Quranic Arabic Corpus
        </a>
        , সংস্করণ ০.৪, © Kais Dukes।
      </p>
      <h2>কনটেন্টের অগ্রগতি</h2>
      <p>
        {contentProgress.completedCount.toLocaleString("bn-BD")} / ৬,২৩৬ আয়াত
        এখন পড়া যায়। প্রতিদিন পরবর্তী ৩০০ আয়াত যোগ করার কাজ নির্ধারিত। অসম্পূর্ণ
        সূরা স্পষ্টভাবে চিহ্নিত থাকে।
      </p>
      <h2>নিজের অগ্রগতি</h2>
      <p>
        বুকমার্ক, অনুশীলনের চিহ্ন ও শেষ পড়ার অবস্থান আপনার ব্রাউজারে থাকে।
        ব্রাউজারের ডেটা মুছে গেলে এগুলো হারাতে পারে।
      </p>
      <a
        href="https://api-docs.quran.foundation/docs/api/field-reference/"
        target="_blank"
        rel="noreferrer"
      >
        তথ্য সরবরাহকারীর ডকুমেন্টেশন ↗
      </a>
    </article>
  );
}
