import "../styles/globals.css"
import type { AppProps } from "next/app"

import { ApolloProvider } from "@apollo/client"
import apolloClient from "../lib/apollo"

export default function App({ Component, pageProps }: AppProps) {
    // return <Component {...pageProps} />
    return (
        <ApolloProvider client={apolloClient}>
            <Component {...pageProps} />
        </ApolloProvider>
    )
}
