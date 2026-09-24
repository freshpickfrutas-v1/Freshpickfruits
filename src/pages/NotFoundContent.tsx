import React from 'react';
import { BlueberryIcon } from '../components/BlueberryIcon';

interface NotFoundContentProps {
  title: string;
  text: string;
  href: string;
  linkLabel: string;
}

export const NotFoundContent: React.FC<NotFoundContentProps> = ({ title, text, href, linkLabel }) => (
  <section className="fp-gradient-hero py-20 sm:py-28">
    <div className="max-w-xl mx-auto px-4 text-center">
      <BlueberryIcon className="w-16 h-16 mx-auto" />
      <h1 className="mt-4 text-2xl sm:text-3xl font-black font-display">{title}</h1>
      <p className="mt-2 text-stone-700">{text}</p>
      <a href={href} className="mt-6 inline-flex px-6 py-3 fp-btn-primary text-sm">
        {linkLabel}
      </a>
    </div>
  </section>
);
