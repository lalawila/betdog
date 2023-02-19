"use client"
import "../styles/globals.css"

import { ApolloProvider } from "@apollo/client"
import apolloClient from "../lib/apollo"

import { WagmiConfig, createClient, configureChains } from "wagmi"
import { polygonMumbai } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"

export default function Layout({ children }: { children: React.ReactNode }) {
    // return <Component {...pageProps} />

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
        <html lang="en">
            <body>
                <ApolloProvider client={apolloClient}>
                    <WagmiConfig client={client}>{children}</WagmiConfig>
                </ApolloProvider>
            </body>
        </html>
    )
}
