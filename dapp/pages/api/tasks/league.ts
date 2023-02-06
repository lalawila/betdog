// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import { League } from ".prisma/client"
import prisma from "@/lib/prisma"
import http from "@/lib/http"

async function getLeague(leagueId: number): Promise<{
    league: {
        id: number
        name: string
        type: string
        logo: string
    }
    country: {
        name: string
        code: string
        flag: string
    }
}> {
    // 获取联赛的比赛
    const response = await http.get("/leagues", {
        params: {
            id: leagueId,
        },
    })

    if (response.data.response.length == 0) {
        throw Error()
    }

    return response.data.response[0]
}

// league:
// id:135
// name:"Serie A"
// type:"League"
// logo:"https://media.api-sports.io/football/leagues/135.png"

// country:
// name:"Italy"
// code:"IT"
// flag:"https://media-3.api-sports.io/flags/it.svg"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const sportId = req.body.sportId
        const leagueData = await getLeague(req.body.leagueId)

        let country = await prisma.country.upsert({
            where: {
                code: leagueData.country.code,
            },
            update: {
                name: leagueData.country.name,
                flagUrl: leagueData.country.flag,
            },
            create: {
                name: leagueData.country.name,
                code: leagueData.country.code,
                flagUrl: leagueData.country.flag,
            },
        })

        const league = await prisma.league.upsert({
            where: {
                apiId: leagueData.league.id,
            },
            update: {
                name: leagueData.league.name,
                logoUrl: leagueData.league.logo,
            },
            create: {
                apiId: leagueData.league.id,
                name: leagueData.league.name,
                logoUrl: leagueData.league.logo,
                countryId: country.id,
                sportId: sportId,
            },
        })

        res.status(200).json({ leagueId: league.id })
    } else {
        res.status(400)
    }
}
