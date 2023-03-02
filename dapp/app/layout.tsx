'use client'

import { ApolloProvider } from '@apollo/client'
import apolloClient from '../lib/apollo'

import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { GlobalNav } from '#/ui/GlobalNav'
import { GlobalMenu } from '#/ui/GlobalMenu'
import { ConnectButton } from '#/ui/ConnectButton'

import { GlobalContextProvider } from '#/contexts/globalContext'

import '../styles/globals.css'

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
                <GlobalContextProvider>
                    <WagmiConfig client={client}>
                        <div className="mx-auto flex max-w-7xl items-start">
                            <GlobalNav />
                            <main className="w-[800px] ">
                                <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
                            </main>
                            <div>
                                <div className="flex justify-end py-2">
                                    <ConnectButton />
                                </div>
                                <GlobalMenu />
                            </div>
                        </div>
                    </WagmiConfig>
                </GlobalContextProvider>
            </body>
        </html>
    )
}
