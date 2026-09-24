import React from 'react';
import { BlueberryIcon } from './BlueberryIcon';

interface ContentImageProps {
  src?: string;
  alt: string;
  /** Text shown on the branded placeholder when there is no photo yet. */
  label?: string;
  emoji?: string;
  className?: string;
  eager?: boolean;
}

/** Shows the photo, or a branded placeholder until a real photo is uploaded. */
export const ContentImage: React.FC<ContentImageProps> = ({ src, alt, label, emoji, className = '', eager }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        loading={eager ? 'eager' : 'lazy'}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#432356] via-[#2F183C] to-[#1E0E27] text-center px-4 ${className}`}
    >
      {emoji ? (
        <span className="text-4xl sm:text-5xl drop-shadow" aria-hidden="true">{emoji}</span>
      ) : (
        <BlueberryIcon className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow" />
      )}
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#DDA83A]">{label}</span>
      )}
    </div>
  );
};

/** Caption under a photo (e.g. "Foto: Fresh Pick" or "Imagen ilustrativa generada con IA"). Use inside a <figure>. */
export const ImageCredit: React.FC<{ text: string }> = ({ text }) => (
  <figcaption className="mt-2 text-[11px] text-stone-500 text-right">{text}</figcaption>
);
