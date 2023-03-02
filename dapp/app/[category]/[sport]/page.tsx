'use client'

import { useQuery } from '@apollo/client'
import { graphql } from '#/gql'

import { utils } from 'ethers'

import { useAccount, useContractRead, useContractWrite } from 'wagmi'

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

function Main() {
    const { data, loading, error } = useQuery(AllGamesQuery)

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

    const odds = []

    return (
        <>
            {data?.games.map((game) => (
                <div key={game.id}>
                    <div>
                        <div>
                            {game.home.name} vs {game.away.name}
                        </div>

                        {game.gambles
                            .find((gamble) => gamble.name === 'Match Winner')
                            ?.outcomes.map((outcome) => {
                                return <span>{outcome}</span>
                            })}
                    </div>
                </div>
            ))}
        </>
    )
}

export default function Page({
    params,
}: {
    params: {
        sport: string
    }
}) {
    if (params.sport === 'football') {
        return <Main />
    } else {
        return <h1>{params.sport}</h1>
    }
}
