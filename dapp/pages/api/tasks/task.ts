// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import { providers, Contract, Wallet, utils } from "ethers"

import fs from "fs"

import * as ipfsClient from "ipfs-http-client"
import proxy from "node-global-proxy"

import http from "@/lib/http"
import prisma from "@/lib/prisma"

import dateFormat from "dateformat"

// type Data = {
//     name: string
// }

async function getFixtures(leagueId: number, season: string, date: string) {
    // 获取联赛的比赛
    const response = await http.get("/fixtures", {
        params: {
            league: leagueId,
            status: "NS",
            season,
            date,
        },
    })
    // console.log(response.data)

    return response.data.response
}

async function getOdds(leagueId: number, season: string, date: string) {
    // 获取赔率
    const response = await http.get("/fixtures", {
        params: {
            league: leagueId,
            status: "NS",
            season,
            date,
        },
    })
    // console.log(response.data)

    return response.data.response
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    // infura 的接口被墙
    // 所以本地调试需要设置代理
    if (process.env.NODE_ENV === "development") {
        console.log("development")
        proxy.setConfig(process.env.PROXY)
        proxy.start()
    }

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
        const fixtures = await getFixtures(
            league.apiId,
            "2022",
            dateFormat(Date.now(), "yyyy-mm-dd	"),
        )
        for (const fixture of fixtures) {
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

                const data = JSON.stringify(fixture)

                const result = await client.add(data, { pin: true })

                // 2. 创建 game 至合约。
                await core.createGame(
                    Date.now(),
                    Date.now() + 60 * 60,
                    result.cid.toV0().multihash.bytes.slice(2),
                )

                const gameId = (await core.lastGameId()).toNumber()
                console.log(gameId)

                // 3. 记录至数据库。
                const game = await prisma.game.create({
                    data: {
                        ipfs: result.path,
                        apiId: fixture.fixture.id,
                        leagueId: league.id,
                    },
                })
                console.log(game)

                // 创建 gameble，比如输赢平，进球，之类
            }
        }
    }

    if (process.env.NODE_ENV === "development") {
        proxy.stop()
    }

    res.status(200).json({})
}
