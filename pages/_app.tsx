import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Layout from '@/components/Layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Royal Darts - Elite Performance Analytics</title>
        <meta name="description" content="Royal Darts Analytics Platform - Elite Performance Insights & Tournament Statistics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="https://i.postimg.cc/vZ6By1rw/temp-Image-ZZJWG4.avif" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
