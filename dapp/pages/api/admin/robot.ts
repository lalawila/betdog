// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import { providers, Contract, Wallet, utils } from "ethers"

import fs from "fs"

import * as ipfsClient from "ipfs-http-client"
import proxy from "node-global-proxy"

import http from "@/lib/rapidapi"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

import dateFormat from "dateformat"

// type Data = {
//     name: string
// }

async function getFixtures(
    leagueApiId: number,
    season: string,
    date: string,
): Promise<
    {
        fixture: {
            id: number
            timestamp: number
        }
        teams: {
            home: {
                id: number
                name: string
                logo: string
            }
            away: {
                id: number
                name: string
                logo: string
            }
        }
    }[]
> {
    // 获取联赛的比赛
    const response = await http.get("/fixtures", {
        params: {
            league: leagueApiId,
            status: "NS",
            season,
            date,
        },
    })

    return response.data.response
}

async function getOdds(fixtureApiId: number): Promise<
    {
        name: string
        values: {
            value: string
            odd: string
        }[]
    }[]
> {
    // 获取赔率
    const response = await http.get("/odds", {
        params: {
            fixture: fixtureApiId,
            bookmaker: 8, // bet365
        },
    })
    // bookmakers:
    //     id:1
    //     name:"10Bet"
    //     bets:
    //         id:1
    //         name:"Match Winner"
    //         values:
    //             value:"Home"
    //             odd:"3.90"
    //             value:"Draw"
    //             odd:"3.45"
    //             value:"Away"
    //             odd:"2.00"

    console.log(response.data)
    return response.data.response[0].bookmakers[0].bets
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    // infura 的接口被墙
    // 所以本地调试需要设置代理
    if (process.env.PROXY && process.env.NODE_ENV === "development") {
        proxy.setConfig(process.env.PROXY)
        proxy.start()
    }

    const multiplier = 1e9

    const auth =
        "Basic " +
        Buffer.from(
            process.env["INFURA_IPFS_ID"] + ":" + process.env["INFURA_IPFS_SECRECT"],
        ).toString("base64")

    const client = ipfsClient.create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
            authorization: auth,
        },
    })

    const coreABI = JSON.parse(
        fs.readFileSync("./abi/contracts/interfaces/ICore.sol/ICore.json", "utf8"),
    )

    const address = JSON.parse(fs.readFileSync("./address.json", "utf8"))

    const { AlchemyProvider } = providers

    const provider = new AlchemyProvider("maticmum", process.env["ALCHEMY_MUMBAI_KEY"])

    const signer = new Wallet(process.env["PRIVATE_KEY"] as string, provider)

    const core = new Contract(address["Core"], coreABI, signer)

    const leagues = await prisma.league.findMany()

    for (const league of leagues) {
        const time = new Date()
        for (const _ of Array(3).fill(0)) {
            const fixtures = await getFixtures(league.apiId, "2022", dateFormat(time, "yyyy-mm-dd"))
            time.setDate(time.getDate() + 1)

            for (const fixture of fixtures) {
                const data = JSON.stringify(fixture)
                if (
                    (await prisma.game.findFirst({
                        where: {
                            apiId: fixture.fixture.id,
                        },
                    })) === null
                ) {
                    // 数据库中没有 game
                    // 1. 详细保存至 IPFS。
                    // 2. 创建 game 至合约。
                    // 3. 新建记录至数据库。

                    // 1. 详细保存至 IPFS。

                    // js-multiformats

                    const result = await client.add(data, { pin: true })

                    // 2. 创建 game 至合约。
                    console.log("createGame")
                    await (await core.createGame(result.cid.toV0().multihash.bytes.slice(2))).wait()

                    console.log("lastGameId")
                    const gameId = (await core.lastGameId()).toNumber()
                    console.log(gameId)

                    // 3. 记录至数据库。
                    const game = await prisma.game.create({
                        data: {
                            contractId: gameId,
                            ipfs: result.path,
                            apiId: fixture.fixture.id,
                            league: {
                                connect: {
                                    id: league.id,
                                },
                            },
                            timestamp: fixture.fixture.timestamp,
                            home: {
                                connectOrCreate: {
                                    where: {
                                        apiId: fixture.teams.home.id,
                                    },
                                    create: {
                                        apiId: fixture.teams.home.id,
                                        name: fixture.teams.home.name,
                                        logoUrl: fixture.teams.home.logo,
                                    },
                                },
                            },
                            away: {
                                connectOrCreate: {
                                    where: {
                                        apiId: fixture.teams.away.id,
                                    },
                                    create: {
                                        apiId: fixture.teams.away.id,
                                        name: fixture.teams.away.name,
                                        logoUrl: fixture.teams.away.logo,
                                    },
                                },
                            },
                        },
                    })
                    console.log(game)

                    // 创建 gamble，比如输赢平，进球，之类
                    const bets = await getOdds(fixture.fixture.id)

                    let i = 0
                    for (const bet of bets) {
                        if (i == 5) break
                        await prisma.$transaction(
                            async (tx) => {
                                const outcomes = bet.values.map((item) => item.value) as string[]
                                const initialOdds = bet.values.map(
                                    (item) => new Prisma.Decimal(item.odd),
                                )

                                // address token,
                                // uint256 gameId,
                                // string calldata name,
                                // string[] calldata outcomes,
                                // uint64[] calldata odds,
                                // uint256 lokedReserve
                                console.log("createGamle")
                                console.log(initialOdds)
                                await (
                                    await core.createGamble(
                                        address["TestToken"],
                                        gameId,
                                        bet.name,
                                        outcomes,
                                        initialOdds.map((item) => item.mul(multiplier).toNumber()),
                                        utils.parseEther("10"),
                                    )
                                ).wait()

                                await tx.gamble.create({
                                    data: {
                                        contractId: (await core.lastGambleId()).toNumber(),
                                        name: bet.name,
                                        outcomes,
                                        gameId: game.id,
                                        initialOdds,
                                    },
                                })
                            },
                            {
                                timeout: 100000,
                            },
                        )

                        i++
                    }
                }
            }
        }
    }

    if (process.env.PROXY && process.env.NODE_ENV === "development") {
        proxy.stop()
    }

    res.status(200).json({})
}
