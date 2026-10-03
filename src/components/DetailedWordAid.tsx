import React from "react";
import type { QuranWord } from "../types/quran";
export default function DetailedWordAid({ word }: { word: QuranWord }) {
  const aid = word.detailedAid;
  if (!aid) return null;
  return (
    <div className="detailed-word-aid">
      <p className="aid-summary">
        <strong>সংক্ষেপে মনে রাখুন:</strong>{" "}
        <bdi lang="ar" dir="rtl">
          {word.arabic}
        </bdi>{" "}
        (<bdi dir="ltr">{word.transliteration}</bdi>) ={" "}
        <strong>{aid.meaning}</strong>।
      </p>
      {aid.urduMeaning && (
        <p>
          <strong>উর্দু শব্দার্থ:</strong>{" "}
          <bdi className="urdu-gloss" lang="ur" dir="rtl">
            {aid.urduMeaning}
          </bdi>
        </p>
      )}
      <p>
        <strong>
          {aid.kind === "meaning"
            ? "অর্থ দিয়ে সম্পর্ক:"
            : aid.kind === "grammar"
              ? "বাক্যে সম্পর্ক:"
              : "পরিচিত সূত্র:"}
        </strong>{" "}
        {aid.anchor}
      </p>
      <p>{aid.connection}</p>
      <h4>কীভাবে মনে রাখবেন</h4>
      <ol className="aid-steps">
        {aid.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      {aid.parts.length > 1 && (
        <div className="aid-parts">
          <h4>যুক্ত ছোট অংশগুলো</h4>
          <ul>
            {aid.parts.map((part, i) => (
              <li key={i}>
                <bdi lang="ar" dir="rtl">
                  {part.arabic}
                </bdi>
                <span>{part.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="aid-context">
        <h4>এই জায়গার শব্দগুলোর অর্থ</h4>
        <ul>
          {aid.context.map((part, i) => (
            <li key={i}>
              <bdi lang="ar" dir="rtl">
                {part.arabic}
              </bdi>
              <span>{part.meaning}</span>
            </li>
          ))}
        </ul>
      </div>
      {aid.meaningNote && (
        <p className="aid-note">
          <strong>শব্দার্থ স্পষ্টীকরণ:</strong> {aid.meaningNote}
        </p>
      )}
      {aid.caution && (
        <p className="aid-note">
          <strong>পার্থক্যটি মনে রাখুন:</strong> {aid.caution}
        </p>
      )}
      <details className="aid-sources">
        <summary>শব্দের সম্পর্ক ও অর্থের উৎস</summary>
        <ul>
          {aid.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
