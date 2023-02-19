// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "#/lib/prisma"
import { Status } from "@prisma/client"

import { core } from "#/lib/contract"
import { getFixtureById } from "#/lib/rapidapi"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const games = await prisma.game.findMany({
        where: {
            status: Status.NotStarted,
            timestamp: {
                lt: Math.floor(Date.now() / 1000),
            },
        },
    })

    for (const game of games) {
        const fixtureData = await getFixtureById(game.apiId)
        if (["FT", "AET", "PEN"].includes(fixtureData.fixture.status.short)) {
            console.log("finished")
        }
    }

    res.status(200).json({})
}
