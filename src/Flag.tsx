import gb1x1 from 'flag-icons/flags/1x1/gb.svg';
import es1x1 from 'flag-icons/flags/1x1/es.svg';
import br1x1 from 'flag-icons/flags/1x1/br.svg';
import fr1x1 from 'flag-icons/flags/1x1/fr.svg';
import de1x1 from 'flag-icons/flags/1x1/de.svg';
import it1x1 from 'flag-icons/flags/1x1/it.svg';
import jp1x1 from 'flag-icons/flags/1x1/jp.svg';
import gb4x3 from 'flag-icons/flags/4x3/gb.svg';
import es4x3 from 'flag-icons/flags/4x3/es.svg';
import br4x3 from 'flag-icons/flags/4x3/br.svg';
import fr4x3 from 'flag-icons/flags/4x3/fr.svg';
import de4x3 from 'flag-icons/flags/4x3/de.svg';
import it4x3 from 'flag-icons/flags/4x3/it.svg';
import jp4x3 from 'flag-icons/flags/4x3/jp.svg';

/* Canonical country codes used by LANG_META (i18n.tsx) */
export type FlagCode = 'gb' | 'es' | 'br' | 'fr' | 'de' | 'it' | 'jp';

interface FlagProps {
  code: FlagCode;
  /** 'round' (1x1, for the header button) or 'rect' (4x3, for the menu). */
  shape: 'round' | 'rect';
}

const ROUND: Record<FlagCode, string> = {
  gb: gb1x1,
  es: es1x1,
  br: br1x1,
  fr: fr1x1,
  de: de1x1,
  it: it1x1,
  jp: jp1x1,
};

const RECT: Record<FlagCode, string> = {
  gb: gb4x3,
  es: es4x3,
  br: br4x3,
  fr: fr4x3,
  de: de4x3,
  it: it4x3,
  jp: jp4x3,
};

export function Flag({ code, shape }: FlagProps) {
  return (
    <img
      className={`flag flag-${shape}`}
      src={shape === 'round' ? ROUND[code] : RECT[code]}
      alt=""
      draggable={false}
    />
  );
}