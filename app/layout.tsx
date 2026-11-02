import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import { SearchProvider } from '@/components/SearchProvider';
import { ProgressProvider } from '@/components/ProgressProvider';
import { MotionConfigProvider } from '@/components/MotionConfigProvider';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { RouteTransition } from '@/components/RouteTransition';
import { BlueprintGrid } from '@/components/BlueprintGrid';
import { CourseSwitcherFab } from '@/components/CourseSwitcherFab';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Design Patterns, Visually',
  description:
    'The 23 Gang of Four design patterns, explained with animated illustrations and real Java code. An editorial, motion-first learning resource for engineers.',
  metadataBase: new URL('https://designpatterns.visually')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="relative min-h-dvh">
        <ThemeProvider>
          <LocaleProvider>
            <SearchProvider>
              <MotionConfigProvider>
                <ProgressProvider>
                  <BlueprintGrid />
                  <div className="relative z-10 flex min-h-dvh flex-col">
                    <Nav />
                    <main className="flex-1">
                      <RouteTransition>{children}</RouteTransition>
                    </main>
                    <Footer />
                    <CourseSwitcherFab />
                  </div>
                </ProgressProvider>
              </MotionConfigProvider>
            </SearchProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
