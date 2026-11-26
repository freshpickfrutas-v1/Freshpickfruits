import React, { useEffect, useState } from 'react';
import { Loader2, Copy, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { SocialPieces } from './GenerateSocialPieces';
import { enlaceTiendaX, intentX, pesoTotalX, textoXConEnlace } from '../lib/socialLinks';

type Resultado = { ok: boolean; id?: string; error?: string };
interface QueueItem {
  id: string;
  tipo: 'noticia' | 'receta';
  title: string;
  url: string;
  slug?: string;
  imageUrl?: string;
  pieces: SocialPieces;
  status: 'pendiente' | 'publicado' | 'rechazado';
  resultados?: Record<string, Resultado>;
  createdAt: string;
  publicadoEn?: string;
}

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const REDES = { facebook: 'Facebook', instagram: 'Instagram' } as const;

/** Borradores de redes sociales: se revisan, se editan y se aprueban (publican en Facebook e Instagram) o se rechazan. */
export function SocialQueue() {
  const { user } = useAuth();
  const [items, setItems] = useState<QueueItem[] | null>(null);
  const [porPreparar, setPorPreparar] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(true);
  const [busy, setBusy] = useState('');
  const [edits, setEdits] = useState<Record<string, SocialPieces>>({});
  const [copied, setCopied] = useState('');

  async function call(body?: unknown) {
    const token = await user?.getIdToken();
    if (!token) throw new Error('No hay sesión');
    const res = await fetch('/api/admin/social-queue', {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
    return json;
  }

  async function load() {
    try {
      setError('');
      const json = await call();
      setItems(json.items as QueueItem[]);
      setPorPreparar(typeof json.porPreparar === 'number' ? json.porPreparar : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar.');
      setItems([]);
    }
  }
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function generar() {
    setBusy('generar'); setError(''); setMsg(''); setMsgOk(true);
    try {
      const r = await call({ accion: 'generar' });
      setMsg(r.creados?.length ? `Listo: ${r.creados.length} borrador(es) nuevo(s). Quedan ${r.quedan ?? 0} recetas y noticias por preparar.` : 'Todas las recetas y noticias del sitio ya tienen borrador.');
      if (r.errores?.length) setError(`Algunos fallaron: ${r.errores.join(' · ')}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar.');
    } finally { setBusy(''); }
  }

  const piezasDe = (it: QueueItem) => edits[it.id] ?? it.pieces;
  const editar = (it: QueueItem, cambio: Partial<SocialPieces>) => setEdits(e => ({ ...e, [it.id]: { ...piezasDe(it), ...cambio } }));

  async function publicar(it: QueueItem) {
    const conIg = !!it.imageUrl;
    if (!window.confirm(`¿Aprobar y publicar "${it.title}" en Facebook${conIg ? ' e Instagram' : ''}? Se verá público de inmediato.`)) return;
    setBusy(it.id); setError(''); setMsg('');
    try {
      const r = await call({ accion: 'publicar', id: it.id, pieces: piezasDe(it) });
      const partes = Object.entries(r.resultados as Record<string, Resultado>).map(([k, v]) => `${REDES[k as keyof typeof REDES] ?? k}: ${v.ok ? 'publicado' : `falló (${v.error})`}`);
      setMsg(partes.join(' · '));
      setMsgOk(Object.values(r.resultados as Record<string, Resultado>).every(v => v.ok));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar.');
    } finally { setBusy(''); }
  }

  async function rechazar(it: QueueItem) {
    if (!window.confirm(`¿Rechazar el borrador de "${it.title}"? No se publicará en redes.`)) return;
    setBusy(it.id); setError('');
    try { await call({ accion: 'rechazar', id: it.id }); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo rechazar.'); }
    finally { setBusy(''); }
  }

  function copiar(texto: string, key: string) {
    void navigator.clipboard.writeText(texto);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  const pendientes = (items ?? []).filter(i => i.status === 'pendiente');
  const historial = (items ?? []).filter(i => i.status !== 'pendiente');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600 max-w-2xl">
          La IA prepara borradores para todas las recetas y noticias del sitio, de las más nuevas a las más antiguas (3 por día, o 3 cada vez que pulses el botón). Nada sale a las redes hasta que lo apruebes aquí.
        </p>
        <button type="button" onClick={generar} disabled={busy === 'generar'} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#EADBEE] text-sm font-semibold text-[#2F183C] hover:bg-[#F5ECF9] disabled:opacity-60 cursor-pointer">
          {busy === 'generar' && <Loader2 className="w-4 h-4 animate-spin" />}
          Generar 3 borradores ahora
        </button>
      </div>

      {porPreparar !== null && (
        <p className="text-sm text-stone-700 bg-white border border-[#EADBEE] rounded-xl px-3 py-2">
          {porPreparar > 0
            ? `Faltan ${porPreparar} recetas y noticias del sitio por preparar. Se preparan 3 cada día (o 3 cada vez que pulses el botón), de las más nuevas a las más antiguas.`
            : 'Todas las recetas y noticias del sitio ya tienen su borrador.'}
        </p>
      )}
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
      {msg && <p className={`text-sm rounded-xl px-3 py-2 border ${msgOk ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-red-700 bg-red-50 border-red-200'}`}>{msg}</p>}
      {items === null && <p className="text-sm text-stone-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</p>}
      {items && pendientes.length === 0 && <p className="text-sm text-stone-500">No hay borradores pendientes.</p>}

      {pendientes.map(it => {
        const p = piezasDe(it);
        const ocupado = busy === it.id;
        return (
          <div key={it.id} className="bg-white rounded-2xl border border-[#EADBEE] p-4 space-y-3">
            <div className="flex items-start gap-3">
              {it.imageUrl && <img src={it.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0 bg-stone-100" />}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase text-[#7B4382]">{it.tipo === 'noticia' ? 'Noticia' : 'Receta'} · borrador del {fmt(it.createdAt)}</p>
                <p className="text-sm font-bold text-[#2F183C]">{it.title}</p>
                <a href={it.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#7B4382] underline inline-flex items-center gap-1">Ver en el sitio <ExternalLink className="w-3 h-3" /></a>
                {!it.imageUrl && <p className="text-xs text-amber-700 mt-1">Sin imagen: solo se publicará en Facebook.</p>}
              </div>
            </div>

            {it.resultados && (Object.entries(it.resultados) as [string, Resultado][]).some(([, v]) => !v.ok) && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {(Object.entries(it.resultados) as [string, Resultado][]).filter(([, v]) => !v.ok).map(([k, v]) => `${REDES[k as keyof typeof REDES] ?? k}: ${v.error}`).join(' · ')}
              </p>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs font-bold text-[#2F183C]">Instagram</span>
                <textarea className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm min-h-[200px] resize-y" value={p.instagram.copy} onChange={e => editar(it, { instagram: { ...p.instagram, copy: e.target.value } })} />
                <span className="block text-xs text-stone-500 leading-relaxed">{p.instagram.hashtags.join(' ')}</span>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold text-[#2F183C]">Facebook (el enlace se añade solo)</span>
                <textarea className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm min-h-[200px] resize-y" value={p.facebook.copy} onChange={e => editar(it, { facebook: { copy: e.target.value } })} />
              </label>
              <div className="space-y-1">
                <span className="flex items-center justify-between text-xs font-bold text-[#2F183C]">
                  X (se publica a mano)
                  <button type="button" onClick={() => copiar(textoXConEnlace(p.x.copy, it.tipo, it.slug), it.id)} className="inline-flex items-center gap-1 text-[#7B4382] cursor-pointer"><Copy className="w-3 h-3" />{copied === it.id ? 'Copiado' : 'Copiar con enlace'}</button>
                </span>
                <textarea className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm min-h-[140px] resize-y" value={p.x.copy} onChange={e => editar(it, { x: { copy: e.target.value } })} />
                <span className={`block text-xs ${pesoTotalX(p.x.copy) > 280 ? 'text-red-700 font-bold' : 'text-stone-500'}`}>{pesoTotalX(p.x.copy)}/280 (texto + enlace a la tienda)</span>
                <span className="block text-xs text-stone-500 break-all">Enlace que lleva siempre: {enlaceTiendaX(it.tipo, it.slug)}</span>
                <a href={intentX(p.x.copy, it.tipo, it.slug)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#7B4382] underline">Abrir en X con el enlace <ExternalLink className="w-3 h-3" /></a>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => publicar(it)} disabled={ocupado} className="px-4 py-2 rounded-xl bg-[#2F183C] text-white text-sm font-bold disabled:opacity-60 cursor-pointer">
                {ocupado ? 'Publicando…' : 'Aprobar y publicar en FB e IG'}
              </button>
              <button type="button" onClick={() => rechazar(it)} disabled={ocupado} className="px-4 py-2 rounded-xl border border-[#DFCEE6] text-sm font-semibold text-[#2F183C] disabled:opacity-60 cursor-pointer">Rechazar</button>
            </div>
          </div>
        );
      })}

      {historial.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EADBEE] divide-y divide-[#F0E6F3]">
          <p className="px-4 py-3 text-sm font-bold text-[#2F183C]">Historial</p>
          {historial.map(it => (
            <div key={it.id} className="px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-2">
              <span className="min-w-0 truncate text-[#2F183C]">{it.title}</span>
              <span className="text-xs text-stone-500">{it.status === 'publicado' ? `Publicado ${fmt(it.publicadoEn)}` : 'Rechazado'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
