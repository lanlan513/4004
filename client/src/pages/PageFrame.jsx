import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageFrame({ eyebrow, title, intro, children }) {
  return (
    <section className="min-h-screen bg-jungle-950 px-6 pb-24 pt-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-serif text-sm tracking-widest text-bone/60 transition-colors hover:text-amber"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>
        <p className="mt-14 flex items-center gap-4 font-display text-xs tracking-[0.45em] text-amber md:text-sm">
          <span className="h-px w-12 bg-amber/70" />
          {eyebrow}
        </p>
        <h1 className="mt-5 font-serif text-5xl font-black leading-tight text-bone md:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl font-serif text-base leading-relaxed text-bone/65 md:text-lg">
          {intro}
        </p>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
