import { render } from '@testing-library/react';
import { Flag } from '../Flag';

/**
 * Vite may resolve an SVG import either as a file URL (e.g.
 * "/node_modules/flag-icons/flags/1x1/es.svg") or, for small files, as an
 * inlined data URI ("data:image/svg+xml,..."). Both formats embed the flag
 * code, so match either representation.
 */
function matchesFlag(src: string | null, code: string): boolean {
  if (!src) return false;
  return src.includes(`${code}.svg`) || src.includes(`flag-icons-${code}`);
}

function getImg(): HTMLImageElement {
  const img = document.querySelector('img');
  if (!img) throw new Error('Expected an <img> element to be rendered');
  return img;
}

describe('Flag', () => {
  it('renders a round flag image for a known code', () => {
    render(<Flag code="es" shape="round" />);

    const img = getImg();
    expect(img).toHaveClass('flag flag-round');
    expect(matchesFlag(img.getAttribute('src'), 'es')).toBe(true);
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('renders a rect flag image for a known code', () => {
    render(<Flag code="gb" shape="rect" />);

    const img = getImg();
    expect(img).toHaveClass('flag flag-rect');
    expect(matchesFlag(img.getAttribute('src'), 'gb')).toBe(true);
  });

  it('renders with empty alt text for accessibility', () => {
    render(<Flag code="jp" shape="round" />);
    expect(getImg()).toHaveAttribute('alt', '');
  });

  it('uses different assets for round and rect shapes of the same code', () => {
    const { rerender } = render(<Flag code="fr" shape="round" />);
    const roundSrc = getImg().getAttribute('src');
    rerender(<Flag code="fr" shape="rect" />);
    const rectSrc = getImg().getAttribute('src');

    expect(matchesFlag(roundSrc, 'fr')).toBe(true);
    expect(matchesFlag(rectSrc, 'fr')).toBe(true);
    expect(roundSrc).not.toBe(rectSrc);
  });
});