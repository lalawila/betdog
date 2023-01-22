// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

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
    const leagues = await prisma.league.findMany()

    for (const leagueId of leagues) {
        const fixtures = await getFixtures(leagues[0].apiId, "2022", "2023-01-22")
    }
    res.status(200).json(data)
}
