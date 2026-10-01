import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { PlacePick, Suggestion, mapsEnabled, mapsLink, newSessionToken, placeDetails, suggestPlaces } from '../lib/maps';

interface AddressFieldProps {
  value: string;
  onChange: (text: string) => void;
  place: PlacePick | null;
  onPlace: (place: PlacePick | null) => void;
  invalid?: boolean;
  placeholder?: string;
  className?: string;
}

/** Street address with Google Maps suggestions (Bogotá only). Falls back to a plain field when no Maps key is set. */
export const AddressField: React.FC<AddressFieldProps> = ({ value, onChange, place, onPlace, invalid, placeholder, className }) => {
  const [options, setOptions] = useState<Suggestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const token = useRef(newSessionToken());
  const abort = useRef<AbortController | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const type = (text: string) => {
    onChange(text);
    if (place) onPlace(null); // the pin no longer matches what is typed
    setNote('');
    window.clearTimeout(timer.current);
    abort.current?.abort();
    if (!mapsEnabled || text.trim().length < 4) { setOptions([]); return; }
    timer.current = window.setTimeout(async () => {
      const ctl = new AbortController();
      abort.current = ctl;
      setBusy(true);
      try {
        const found = await suggestPlaces(text.trim(), token.current, ctl.signal);
        setOptions(found);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') { setOptions([]); setNote('No pudimos consultar Google Maps. Escribe la dirección completa y verifícala con el enlace.'); }
      } finally { setBusy(false); }
    }, 300);
  };

  const pick = async (s: Suggestion) => {
    setOpen(false);
    setBusy(true);
    try {
      const p = await placeDetails(s.placeId, token.current);
      token.current = newSessionToken(); // a new search session starts after each selection
      onChange(p.address);
      onPlace(p);
      setOptions([]);
    } catch {
      onChange(`${s.main}${s.secondary ? ', ' + s.secondary.replace(/,\s*Bogot[aá].*$/i, '') : ''}`);
      setNote('No pudimos fijar el punto en el mapa. Verifica la dirección con el enlace.');
    } finally { setBusy(false); }
  };

  return (
    <div ref={wrap} className="relative space-y-1.5">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B4382] pointer-events-none" />
        <input
          className={className ?? 'w-full border border-stone-300 rounded-xl pl-9 pr-9 py-2 text-sm focus:border-[#7B4382] focus:ring-1 focus:ring-[#7B4382] outline-none'}
          style={{ paddingLeft: '2.25rem' }}
          placeholder={placeholder ?? 'Calle o carrera y número (ej. Calle 100 # 15-20)'}
          value={value}
          onChange={e => type(e.target.value)}
          onFocus={() => options.length && setOpen(true)}
          aria-invalid={invalid}
          name="street-address"
          autoComplete="address-line1"
        />
        {busy && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-stone-400" />}
      </div>

      {open && options.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 bg-white border border-[#EADBEE] rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {options.map(o => (
            <li key={o.placeId}>
              <button type="button" onClick={() => pick(o)} className="w-full text-left px-3 py-2.5 hover:bg-[#F5ECF9] flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#7B4382]" />
                <span className="text-sm text-[#2F183C]">
                  <span className="font-semibold">{o.main}</span>
                  {o.secondary && <span className="block text-xs text-stone-500">{o.secondary}</span>}
                </span>
              </button>
            </li>
          ))}
          <li className="px-3 py-1.5 text-[10px] text-stone-400 text-right">Powered by Google</li>
        </ul>
      )}

      {place ? (
        <p className="text-xs text-emerald-700 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Ubicación confirmada en Google Maps.
          <a href={mapsLink(place)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold underline">Ver mapa <ExternalLink className="w-3 h-3" /></a>
        </p>
      ) : value.trim().length > 4 ? (
        <p className="text-xs text-stone-500">
          {mapsEnabled ? 'Elige una sugerencia para fijar el punto exacto. ' : ''}
          <a href={mapsLink({ address: value })} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-[#7B4382] underline">Verificar en Google Maps <ExternalLink className="w-3 h-3" /></a>
        </p>
      ) : null}
      {note && <p className="text-xs text-amber-700">{note}</p>}
    </div>
  );
};
