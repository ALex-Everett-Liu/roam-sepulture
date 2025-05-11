import { AppProps } from 'next/app';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  console.log('_app.tsx is rendering');
  return <Component {...pageProps} />;
} 