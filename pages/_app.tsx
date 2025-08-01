// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import EliteLayout from '@/components/EliteLayout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EliteLayout>
      <Component {...pageProps} />
    </EliteLayout>
  )
}
