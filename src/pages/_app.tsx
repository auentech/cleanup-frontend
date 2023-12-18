import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { NextUIProvider } from '@nextui-org/react'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastContainer } from 'react-toastify'

const queryClient = new QueryClient()

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <NextUIProvider>
                <SessionProvider session={session}>
                    <Component {...pageProps} />
                </SessionProvider>
            </NextUIProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            <ToastContainer />
        </QueryClientProvider>
    )
}
