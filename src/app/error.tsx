"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="empty-state">
      <h1>পাঠটি খুলতে সমস্যা হয়েছে</h1>
      <button className="primary-link" onClick={reset}>
        আবার চেষ্টা করুন
      </button>
    </section>
  );
}
