import { AdminAuthProvider } from '@/lib/AdminAuthContext'
import AdminAuthGate from '@/components/layout/AdminAuthGate'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { LogoProvider } from '@/lib/LogoContext'

// Sets data-theme on <html> before paint so the admin shell never flashes
// the wrong palette on load. Mirrors the pure logic in
// src/lib/theme/resolveTheme.ts but inlined as plain JS (no imports
// allowed in a pre-hydration script) and using a cached, time-of-day-only
// approximation of sunrise/sunset — ThemeProvider recomputes the precise
// value (with today's date + live geo) once it hydrates.
const NO_FLASH_SCRIPT = `(function () {
  try {
    var mode = localStorage.getItem('lyptron.theme.mode') || 'auto';
    var theme;
    if (mode === 'light' || mode === 'dark') {
      theme = mode;
    } else {
      var strategy = localStorage.getItem('lyptron.theme.auto.strategy') || 'sunset';
      var now = new Date();
      var fixedTheme = (now.getHours() < 7 || now.getHours() >= 19) ? 'dark' : 'light';
      if (strategy === 'system') {
        theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
      } else if (strategy === 'sunset') {
        var raw = localStorage.getItem('lyptron.theme.sunTimes');
        theme = fixedTheme;
        if (raw) {
          var cached = JSON.parse(raw);
          var sunrise = new Date(cached.sunrise);
          var sunset = new Date(cached.sunset);
          if (!isNaN(sunrise.getTime()) && !isNaN(sunset.getTime())) {
            var nowMin = now.getHours() * 60 + now.getMinutes();
            var sunriseMin = sunrise.getHours() * 60 + sunrise.getMinutes();
            var sunsetMin = sunset.getHours() * 60 + sunset.getMinutes();
            theme = (nowMin < sunriseMin || nowMin >= sunsetMin) ? 'dark' : 'light';
          }
        }
      } else {
        theme = fixedTheme;
      }
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();`

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      <ThemeProvider>
        <LogoProvider>
          <AdminAuthProvider>
            <AdminAuthGate>
              {children}
            </AdminAuthGate>
          </AdminAuthProvider>
        </LogoProvider>
      </ThemeProvider>
    </>
  )
}
