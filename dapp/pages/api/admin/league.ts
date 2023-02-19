// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "#/lib/prisma"
import { getLeagueById } from "#/lib/rapidapi"

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
        const leagueData = await getLeagueById(req.body.apiId)

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
                sport: {
                    connect: {
                        id: sportId,
                    },
                },
                country: {
                    connectOrCreate: {
                        where: {
                            code: leagueData.country.code,
                        },
                        create: {
                            name: leagueData.country.name,
                            code: leagueData.country.code,
                            flagUrl: leagueData.country.flag,
                        },
                    },
                },
            },
        })

        res.status(200).json({ leagueId: league.id })
    } else {
        res.status(400)
    }
}
