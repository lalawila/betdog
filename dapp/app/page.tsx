'use client'

import Head from 'next/head'

import { useQuery } from '@apollo/client'
import { graphql } from '../gql'

import { utils } from 'ethers'

import {
    useAccount,
    useConnect,
    useContractRead,
    useContractWrite,
    useDisconnect,
    usePrepareContractWrite,
} from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

import addresses from '#/address.json'
import coreABI from '#/abi/contracts/interfaces/ICore.sol/ICore.json'
import { erc20ABI } from 'wagmi'
import { waitForTransaction } from '@wagmi/core'

import { useEffect } from 'react'

function Balance() {
    const { address } = useAccount()
    const { data: balance } = useContractRead({
        address: addresses.TestToken as `0x${string}`,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
    })
    return <h1>{balance?.toString()}</h1>
}

function Profile() {
    const { address, isConnected } = useAccount()
    const { connect } = useConnect({
        connector: new InjectedConnector(),
    })
    const { disconnect } = useDisconnect()

    if (isConnected)
        return (
            <div>
                Connected to {address}
                <button onClick={() => disconnect()}>Disconnect</button>
                <Balance />
            </div>
        )
    return <button onClick={() => connect()}>Connect Wallet</button>
}

const AllGamesQuery = graphql(`
    query Games {
        games {
            id
            timestamp
            home {
                id
                name
            }
            away {
                id
                name
            }
            gambles {
                id
                name
                contractId
                outcomes
            }
        }
    }
`)

export default function Home() {
    const { data, loading, error } = useQuery(AllGamesQuery)
    console.log(data)

    const {
        data: transition,
        write: approve,
        isSuccess,
    } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: addresses.TestToken as `0x${string}`,
        abi: erc20ABI,
        functionName: 'approve',
        args: [addresses.Core as `0x${string}`, utils.parseEther('1')],
    })

    const { write: bet } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: addresses.Core as `0x${string}`,
        abi: coreABI,
        functionName: 'bet',
        args: [13, 0, utils.parseEther('1')],
    })

    useEffect(() => {
        async function fetchData() {
            if (transition?.hash) {
                await waitForTransaction({
                    hash: transition?.hash,
                })

                bet()
            }
        }
        fetchData()
    }, [isSuccess, transition])

    if (error) return <div>failed to load</div>
    if (loading) return <div>loading...</div>

    return (
        <>
            <Profile />
            {data?.games.map((game) => (
                <div key={game.id}>
                    <h1>
                        {game.home.name} vs {game.away.name}
                    </h1>
                    {game.gambles.map((gamble) => (
                        <div key={gamble.id}>
                            <h3>{gamble.name}</h3>
                            {gamble.outcomes.map((outcome) => (
                                <button key={outcome} onClick={() => approve()}>
                                    {outcome}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </>
    )
}
