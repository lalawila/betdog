// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "#/lib/prisma"
import { getBetById } from "#/lib/rapidapi"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const betData = await getBetById(req.body.apiId)

        await prisma.bet.upsert({
            where: {
                apiId: betData.id,
            },
            create: {
                apiId: betData.id,
                name: betData.name,
            },
            update: {
                name: betData.name,
            },
        })
        res.status(200).json({})
    } else {
        res.status(400)
    }
}
