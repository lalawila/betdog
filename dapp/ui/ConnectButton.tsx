import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

export function ConnectButton() {
    const { address, isConnected } = useAccount()
    const { connect } = useConnect({
        connector: new InjectedConnector(),
    })
    const { disconnect } = useDisconnect()

    if (isConnected) {
        return <h1>{address?.substring(0, 8)}...</h1>
    } else {
        return (
            <div
                onClick={() => connect()}
                className="rounded-sm bg-fuchsia-500 px-6 py-1 text-sm text-black hover:cursor-pointer "
            >
                CONNECT WALLET
            </div>
        )
    }
}
