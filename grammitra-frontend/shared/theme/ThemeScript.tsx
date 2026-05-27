// Inline blocking script: applies the theme class + color-scheme to <html>
// BEFORE first paint, eliminating the FOUC flash that happens when a client
// useEffect applies the theme post-hydration.
//
// IMPORTANT: this is rendered in <head> via `dangerouslySetInnerHTML`, so it
// runs synchronously during HTML parsing — before any CSS or React hydration.

const script = `
(function(){
  try {
    var stored = localStorage.getItem('theme');
    var theme = (stored === 'light' || stored === 'dark')
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var root = document.documentElement;
    root.classList.remove('theme-light','theme-dark');
    root.classList.add('theme-' + theme);
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.classList.add('theme-light');
    document.documentElement.style.colorScheme = 'light';
  }
})();
`;

export default function ThemeScript() {
  return (
    <script
      // Suppress hydration warning for this intentional pre-React script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
