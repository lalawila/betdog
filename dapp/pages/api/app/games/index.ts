// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import { Game } from ".prisma/client"
import prisma from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse<Game[]>) {
    const data = await prisma.game.findMany({
        include: {
            home: true,
            away: true,
        },
    })
    res.status(200).json(data)
}
