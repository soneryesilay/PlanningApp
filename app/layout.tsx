import type { Metadata } from 'next'
import './globals.css'
import './animations.css'
import { ThemeProvider } from '@/components/theme-provider'
import PageTransition from '@/components/page-transition'
import ConditionalFooter from '@/components/conditional-footer'
import Script from 'next/script'; // Import Script component

export const metadata: Metadata = {
  metadataBase: new URL('https://zamanyonetimi.com'),
  title: 'Zaman Yönetimi: Pomodoro, Planlama ve Ders Çalışma Uygulaması',
  description: 'Kapsamlı zaman yönetimi uygulaması ile ders çalışma, Pomodoro tekniği, görev planlama ve takvim özelliklerini keşfedin. Verimliliğinizi artırın!',
  keywords: [
    'zaman yönetimi',
    'pomodoro ders çalışma uygulaması',
    'ders çalışma uygulaması',
    'pomodoro uygulaması',
    'planlama uygulaması',
    'takvim uygulaması',
    'verimlilik uygulaması',
    'görev yönetimi',
    'zaman yönetimi teknikleri',
    'ders çalışma programı',
    'online pomodoro sayacı',
    'sınavlara hazırlık',
    'TYT',
    'AYT',
    'LGS',
    'KPSS',
    'YDS',
    'ALES',
    'odaklanma teknikleri',
    'verimli çalışma',
    'zamanyonetimi.com',
    'sınav hazırlık',
    'ders çalışma',
    'TYT',
    'AYT',
    'LGS',
    'DGS',
    'YDS',
    'KPSS',
    'ALES',
    'bütünleme',
    'final',
    'vize',
    'deneme sınavı',
    'ders programı',
    'çalışma planı',
    'verimli ders çalışma',
    "zaman yönetimi uygulaması",
    "pomodoro uygulaması",
    "Dgs 2025",
    "Dgs 2025 hazırlık",
    "Dgs 2025 çalışma",
    "Dgs 2025 çalışma programı",
    "Dgs 2025 çalışma takvimi",
    "Dgs 2025 çalışma planı",
    "Dgs 2025 çalışma programı örneği",
    "YKS 2025",
    "YKS 2025 hazırlık",
    "YKS 2025 çalışma",
    "YKS 2025 çalışma programı",
    "YKS 2025 çalışma takvimi",
    "TYT 2025",
    "TYT 2025 hazırlık",
    "TYT 2025 çalışma",
    "TYT 2025 çalışma programı",
    "TYT 2025 çalışma takvimi",
    "AYT 2025",
    "AYT 2025 hazırlık",
    "AYT 2025 çalışma",
    "AYT 2025 çalışma programı",
    "AYT 2025 çalışma takvimi",
    "YDS 2025",
    "YDS 2025 hazırlık",
    "YDS 2025 çalışma",
    "YDS 2025 çalışma programı",
    "YDS 2025 çalışma takvimi",
    'odaklanma sorunu',
    'dikkat dağınıklığı',
    'ders çalışamıyorum',
    'motivasyon eksikliği',
    'erteleme hastalığı',
    'çalışma isteksizliği',
    'verimli çalışma teknikleri',
    'ders çalışma motivasyonu',
    'odaklanma teknikleri',
  ],
  generator: 'Zaman Yönetimi',
  applicationName: 'Zaman Yönetimi',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  authors: [
    {
      name: 'Soner Yeşilay',
      url: 'https://soneryesilay.com',
    },
  ],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://zamanyonetimi.com',
    title: 'Zaman Yönetimi: Pomodoro, Planlama ve Ders Çalışma Uygulaması',
    description: 'Kapsamlı zaman yönetimi uygulaması ile ders çalışma, Pomodoro tekniği, görev planlama ve takvim özelliklerini keşfedin. Verimliliğinizi artırın!',
    siteName: 'Zaman Yönetimi Uygulaması',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zaman Yönetimi: Pomodoro, Planlama ve Ders Çalışma Uygulaması',
    description: 'Kapsamlı zaman yönetimi uygulaması ile ders çalışma, Pomodoro tekniği, görev planlama ve takvim özelliklerini keşfedin. Verimliliğinizi artırın!',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Zaman Yönetimi',
  applicationCategory: 'Productivity',
  operatingSystem: 'Web',
  description: 'Zamanınızı etkili bir şekilde yönetmek için planlama, Pomodoro tekniği ve takvim özelliklerini bir arada sunan uygulama.',
  author: {
    '@type': 'Person',
    name: 'Soner Yeşilay',
    url: 'https://soneryesilay.com',
  },
  offers: {
    '@type': 'Offer',
    price: '0', // Assuming it's free. Adjust if there are paid plans.
    priceCurrency: 'TRY',
  },
  keywords: Array.isArray(metadata.keywords) ? metadata.keywords.join(', ') : metadata.keywords, // Reuse keywords
  url: 'https://zamanyonetimi.com',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://zamanyonetimi.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'pink', 'blue', 'yellow', 'system']} // "yellow" teması eklendi
        >
          <PageTransition>
            {children}
            <ConditionalFooter />
          </PageTransition>
        </ThemeProvider>
      </body>
    </html>
  )
}
