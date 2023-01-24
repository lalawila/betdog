// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import { providers, Contract, Wallet, utils } from "ethers"

import fs from "fs"

import * as ipfsClient from "ipfs-http-client"
import proxy from "node-global-proxy"

import http from "../../lib/http"
import prisma from "../../lib/prisma"

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

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const coreABI = JSON.parse(
        fs.readFileSync("./abi/contracts/interfaces/ICore.sol/ICore.json", "utf8"),
    )

    const address = JSON.parse(fs.readFileSync("./address.json", "utf8"))

    const { AlchemyProvider } = providers

    const provider = new AlchemyProvider("maticmum", process.env["ALCHEMY_MUMBAI_KEY"])

    const signer = new Wallet(process.env["PRIVATE_KEY"] as string, provider)

    const core = new Contract(address["Core"], coreABI, signer)

    const leagues = await prisma.league.findMany()

    for (const leagueId of leagues) {
        const fixtures = await getFixtures(leagueId.apiId, "2022", "2023-01-24")
        for (const fixture of fixtures) {
            if (
                (await prisma.game.findFirst({
                    where: {
                        apiId: fixture.fixture.id,
                    },
                })) === null
            ) {
                const data = JSON.stringify({
                    test: "test",
                })

                // 数据库中没有 game
                // 新建 game 至数据库和合约
                await core.createGame(
                    Date.now(),
                    Date.now() + 60 * 60,
                    utils.formatBytes32String("path".substring(2)),
                )

                console.log(await core.lastGameId())
                if (process.env.NODE_ENV === "development") {
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

                const result = await client.add(data)
                console.log(result)

                if (process.env.NODE_ENV === "development") {
                    proxy.stop()
                }
            }
        }
    }
    res.status(200).json({})
}
