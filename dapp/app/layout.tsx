'use client'
import '../styles/globals.css'

import { ApolloProvider } from '@apollo/client'
import apolloClient from '../lib/apollo'

import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { GlobalNav } from '#/ui/GlobalNav'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { chains, provider, webSocketProvider } = configureChains(
        [polygonMumbai],
        [publicProvider()],
    )

    const client = createClient({
        autoConnect: true,
        provider,
        webSocketProvider,
    })
    return (
        <html lang="en" className="[color-scheme:dark]">
            <body className="bg-gray-1100 bg-[url('/grid.svg')]">
                <main className="mx-auto max-w-7xl">
                    <GlobalNav />
                    <div className="lg:pl-72">
                        <ApolloProvider client={apolloClient}>
                            <WagmiConfig client={client}>{children}</WagmiConfig>
                        </ApolloProvider>
                    </div>
                </main>
            </body>
        </html>
    )
}
