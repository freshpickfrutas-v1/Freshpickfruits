import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, RefreshCw, Loader2, Check, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type SocialPieces = {
  instagram: { copy: string; hashtags: string[] };
  facebook: { copy: string };
  x: { copy: string };
};

export type SocialContentInput = {
  tipo: 'receta' | 'noticia' | 'video';
  title: string;
  excerpt?: string;
  body?: string;
  url?: string;
  slug?: string;
};

interface Props {
  content: SocialContentInput;
  initialPieces?: SocialPieces | null;
  onClose?: () => void;
  onSaved?: () => void;
}

export function GenerateSocialPieces({ content, initialPieces, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const [pieces, setPieces] = useState<SocialPieces | null>(initialPieces ?? null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  async function getIdToken() {
    return user ? await user.getIdToken() : null;
  }

  async function generate() {
    setLoading(true);
    setError('');
    setSavedOk(false);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('No hay sesión');

      const res = await fetch('/api/admin/generate-social-pieces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Error desconocido');

      setPieces(data.pieces);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudieron generar las piezas');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!pieces || !content.slug) {
      setError('Falta el slug del contenido para guardar');
      return;
    }
    setSaving(true);
    setError('');
    setSavedOk(false);
    try {
      const id = `${content.tipo}_${content.slug}`;
      await setDoc(
        doc(db, 'content_social_pieces', id),
        {
          tipo: content.tipo,
          slug: content.slug,
          title: content.title,
          pieces,
          generatedAt: serverTimestamp(),
          generatedBy: user?.email ?? '',
          version: 1,
        },
        { merge: true }
      );
      setSavedOk(true);
      onSaved?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar en Firestore');
    } finally {
      setSaving(false);
    }
  }

  function copyText(text: string, network: string) {
    navigator.clipboard.writeText(text);
    setCopied(network);
    setTimeout(() => setCopied(null), 1800);
  }

  const contentUrl =
    content.url ||
    (content.slug
      ? `https://www.freshpickfruits.com/${
          content.tipo === 'receta' ? 'recetas' : content.tipo === 'noticia' ? 'noticias' : 'videos'
        }/${content.slug}`
      : 'https://www.freshpickfruits.com');

  function openX(copy: string) {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(copy)}`,
      '_blank',
      'noopener,noreferrer,width=600,height=560'
    );
  }

  function openFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(contentUrl)}`,
      '_blank',
      'noopener,noreferrer,width=600,height=560'
    );
  }

  async function openInstagram(copy: string) {
    await navigator.clipboard.writeText(copy);
    setCopied('instagram-share');
    setTimeout(() => setCopied(null), 2500);
    // Instagram no permite publicar en feed desde web; abrimos el sitio para pegar en la app.
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  }

  const modal = (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-[#2F183C]">Piezas publicitarias con IA</h2>
            <p className="text-sm text-stone-500 mt-0.5 truncate">{content.title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#EADBEE] text-sm font-semibold text-[#2F183C] hover:bg-[#F5ECF9] disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {pieces ? 'Regenerar' : 'Generar con IA'}
            </button>
            {pieces && content.slug && (
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F183C] text-white text-sm font-bold disabled:opacity-60"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {savedOk ? 'Guardado' : 'Guardar'}
              </button>
            )}
            {onClose && (
              <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-3 py-2">{error}</p>
        )}
        {savedOk && !error && (
          <p className="text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl px-3 py-2">
            Piezas guardadas en Firestore (content_social_pieces).
          </p>
        )}

        {!pieces && !loading && (
          <p className="text-sm text-stone-500">
            Genera copys listos para Instagram, Facebook y X a partir de este contenido.
          </p>
        )}

        {loading && (
          <p className="text-sm text-stone-500 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Generando con Gemini…
          </p>
        )}

        {pieces && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-[#EADBEE] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#2F183C]">Instagram</h3>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      `${pieces.instagram.copy}\n\n${pieces.instagram.hashtags.join(' ')}`,
                      'instagram'
                    )
                  }
                  className="p-1.5 rounded-lg hover:bg-stone-100"
                  title="Copiar"
                >
                  {copied === 'instagram' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <textarea
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm min-h-[220px] resize-y"
                value={pieces.instagram.copy}
                onChange={e =>
                  setPieces({
                    ...pieces,
                    instagram: { ...pieces.instagram, copy: e.target.value },
                  })
                }
              />
              <p className="text-xs text-stone-500 leading-relaxed">{pieces.instagram.hashtags.join(' ')}</p>
              <button
                type="button"
                onClick={() =>
                  openInstagram(`${pieces.instagram.copy}\n\n${pieces.instagram.hashtags.join(' ')}`)
                }
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {copied === 'instagram-share' ? 'Copiado · Abre Instagram y pega' : 'Copiar y abrir Instagram'}
              </button>
            </div>

            <div className="border border-[#EADBEE] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#2F183C]">Facebook</h3>
                <button
                  type="button"
                  onClick={() => copyText(pieces.facebook.copy, 'facebook')}
                  className="p-1.5 rounded-lg hover:bg-stone-100"
                  title="Copiar"
                >
                  {copied === 'facebook' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <textarea
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm min-h-[220px] resize-y"
                value={pieces.facebook.copy}
                onChange={e => setPieces({ ...pieces, facebook: { copy: e.target.value } })}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyText(pieces.facebook.copy, 'facebook')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[#EADBEE] text-[#2F183C]"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar texto
                </button>
                <button
                  type="button"
                  onClick={openFacebook}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#1877F2] text-white"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir Facebook
                </button>
              </div>
            </div>

            <div className="border border-[#EADBEE] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#2F183C]">X</h3>
                <button
                  type="button"
                  onClick={() => copyText(pieces.x.copy, 'x')}
                  className="p-1.5 rounded-lg hover:bg-stone-100"
                  title="Copiar"
                >
                  {copied === 'x' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <textarea
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm min-h-[140px] resize-y"
                value={pieces.x.copy}
                onChange={e => setPieces({ ...pieces, x: { copy: e.target.value } })}
              />
              <p className="text-xs text-stone-500">{pieces.x.copy.length}/280</p>
              <button
                type="button"
                onClick={() => openX(pieces.x.copy)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-black text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Publicar en X
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Se dibuja en <body>: dentro de la lista, un ancestro con transform dejaba el modal fuera de la vista (listas largas).
  return typeof document === 'undefined' ? modal : createPortal(modal, document.body);
}
