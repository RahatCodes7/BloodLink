import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import ProgressBar from '@/components/ProgressBar';
import SupportButton from '@/components/SupportButton';
import PushPrompt from '@/components/PushPrompt';
import InstallPrompt from '@/components/InstallPrompt';

export const metadata = {
  title: 'BloodLink — রক্ত খুঁজুন। জীবন বাঁচান।',
  description: 'বাংলাদেশের জরুরি রক্তদান ও রক্ত অনুরোধ কমিউনিটি প্ল্যাটফর্ম। রক্ত খুঁজুন, রক্তদাতা হন, জীবন বাঁচান।',
  manifest: '/manifest.webmanifest',
  openGraph: { title: 'BloodLink — রক্ত খুঁজুন। জীবন বাঁচান।', description: 'জরুরি সময়ে রক্তদাতা খুঁজুন।', type: 'website', locale: 'bn_BD' }
};
export const viewport = { themeColor: '#b91c1c', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head><link rel="icon" href="/icon.svg" /><link rel="apple-touch-icon" href="/icon-192.png" /></head>
      <body>
        <ProgressBar />
        <Header />
        <main className="max-w-6xl mx-auto px-4 pb-24 md:pb-8 min-h-[70vh]">{children}</main>
        <div className="pb-20 md:pb-0"><Footer /></div>
        <BottomNav />
        <SupportButton />
        <PushPrompt />
        <InstallPrompt />
      </body>
    </html>
  );
}
