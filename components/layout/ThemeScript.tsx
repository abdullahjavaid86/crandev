/**
 * Resolves the theme before first paint. Runs synchronously in <head>, so the
 * .dark class is on <html> by the time anything renders — no flash of the
 * wrong theme, and no client provider wrapping the tree (which would drag the
 * whole app across the server boundary, §2).
 *
 * Also resolves the background and hero-shape variants from storage, for
 * the same reason: picking it after paint would swap backgrounds visibly.
 *
 * Precedence: stored choice > OS preference. The OS is only the first guess;
 * an explicit toggle always wins, which is why this is class-based rather
 * than a prefers-color-scheme media query.
 */
const script = `(function(){try{
var s=localStorage.getItem('theme');
var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.toggle('dark',d);
document.documentElement.style.colorScheme=d?'dark':'light';
var BG=['fields','lattice','grid','none'],SH=['knot','globe','icosahedron','helix','vortex'];
var b=localStorage.getItem('bg');
document.documentElement.dataset.bg=BG.indexOf(b)>=0?b:BG[0];
var sh=localStorage.getItem('shape');
document.documentElement.dataset.shape=SH.indexOf(sh)>=0?sh:SH[0];
}catch(e){}})()`;

export function ThemeScript() {
  // Static string, no interpolation of anything user-controlled.
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
