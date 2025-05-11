// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        {/* This script polyfills the 'global' object */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof global === 'undefined') {
              window.global = window;
            }
          `
        }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}