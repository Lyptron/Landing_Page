import { Inter, IBM_Plex_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { GoogleAnalytics } from '@next/third-parties/google'
import { LenisProvider } from '@/components/providers/LenisProvider'
import { CursorProvider } from '@/components/providers/CursorProvider'
import CursorMount from '@/components/ui/CursorMount'
import { LazyMotion, domAnimation } from 'framer-motion'
import ScrollProgress from '@/components/layout/ScrollProgress'
import Nav from '@/components/layout/Nav'
import GlowOrbs from '@/components/ui/GlowOrbs'
import '@/app/globals.css'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

const satoshi = localFont({
  src: [
    {
      path: '../../public/fonts/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Satoshi-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Satoshi-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
  // Only preload the most-used weights for first paint; the rest fetch on demand.
  preload: true,
})

// Inter is used for body copy in a few places — let it load on demand rather
// than blocking first paint with multiple weights preloaded.
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
})

// IBM Plex Mono is only used for small labels / eyebrows — not critical for paint.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  preload: false,
})

const NO_FLASH_SCRIPT = `(function () {
  try {
    var mode = localStorage.getItem('lyptron.theme.mode') || 'dark';
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

const SITE_URL = 'https://lyptron.com'
const SITE_NAME = 'Lyptron'
const TITLE = 'Lyptron — Web, SaaS, Mobile & AI Product Studio'
const DESCRIPTION =
  'Lyptron is a product studio that designs and ships high-performance websites, SaaS platforms, mobile apps, and AI automation for founders.'
const KEYWORDS = [
  'digital agency',
  'web development agency',
  'SaaS development company',
  'AI automation agency',
  'product design studio',
  'UI UX design agency',
  'mobile app development',
  'cloud infrastructure consulting',
  'brand strategy agency',
  'custom software development',
  'startup product studio',
  'Next.js development agency',
  'Lyptron',
]

// Next 14+ requires viewport / themeColor to be exported separately from
// `metadata`; bundling them there triggers a deprecation warning.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfaf3' },
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
  ],
}

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/favicon.ico', sizes: '32x32' },
      { url: '/images/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: [
      { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/images/site.webmanifest',
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'Lyptron — Future-Grade Digital Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/web-app-manifest-512x512.png'],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: '88ed57b69239e942',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/web-app-manifest-512x512.png`,
      },
      description: DESCRIPTION,
      sameAs: [
        'https://www.linkedin.com/company/lyptron',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}/#service`,
      name: SITE_NAME,
      image: `${SITE_URL}/images/web-app-manifest-512x512.png`,
      url: SITE_URL,
      description: DESCRIPTION,
      priceRange: '$$$',
      areaServed: 'Worldwide',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Lyptron Services',
        itemListElement: [
          'Web Development',
          'Mobile Engineering',
          'AI Integration & Automation',
          'UI/UX Design',
          'Cloud & Infrastructure',
          'Brand & Growth Strategy',
        ].map((svc) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: svc,
            provider: { '@id': `${SITE_URL}/#organization` },
          },
        })),
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Warm DNS + TLS to Google Analytics before its script tag actually runs. */}
        {GA_ID && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <link rel="dns-prefetch" href="https://www.google-analytics.com" />
          </>
        )}
        <script
          dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${satoshi.variable} ${inter.variable} ${ibmPlexMono.variable} bg-bg text-[--text-primary] antialiased`}>
        {/* LazyMotion + domAnimation lets the marketing pages' <m.* /> components
            ship only the basic animation features instead of the full motion bundle.
            Admin/client portal pages that use <motion.* /> directly are unaffected. */}
        <LazyMotion features={domAnimation} strict={false}>
          <LenisProvider>
            <CursorProvider>
              <GlowOrbs />
              <CursorMount />
              <ScrollProgress />
              <Nav />
              {children}
            </CursorProvider>
          </LenisProvider>
        </LazyMotion>
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  )
}
