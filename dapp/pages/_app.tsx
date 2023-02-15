import "../styles/globals.css"
import type { AppProps } from "next/app"

import { ApolloProvider } from "@apollo/client"
import apolloClient from "../lib/apollo"

import { WagmiConfig, createClient, configureChains } from "wagmi"
import { polygonMumbai } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"

export default function App({ Component, pageProps }: AppProps) {
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
        <ApolloProvider client={apolloClient}>
            <WagmiConfig client={client}>
                <Component {...pageProps} />
            </WagmiConfig>
        </ApolloProvider>
    )
}
