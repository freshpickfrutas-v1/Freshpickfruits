import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  /** id of the end-of-article call to action; the floating button hides while that one is on screen. */
  endId?: string;
}

/** Buy button pinned to the right edge once the reader has scrolled into the article. */
export const FloatingBuyButton: React.FC<Props> = ({ endId = 'cta-final' }) => {
  const { isStaff } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById(endId);
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [endId]);

  const visible = scrolled && !atEnd && !isStaff;

  return (
    <a
      href="/#pedidos-personalizados"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 px-3 py-4 rounded-2xl bg-[#DDA83A] text-[#2F183C] font-bold text-xs shadow-xl shadow-[#2F183C]/30 hover:bg-[#C59328] transition-all duration-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6 pointer-events-none'}`}
    >
      <ShoppingBag className="w-5 h-5" />
      <span className="[writing-mode:vertical-rl] rotate-180 tracking-wide">Comprar arándanos</span>
    </a>
  );
};
