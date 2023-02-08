// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import { Sport } from ".prisma/client"
import prisma from "@/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse<Sport>) {
    const data = await prisma.sport.findUniqueOrThrow({
        where: {
            id: parseInt(req.query.id as string),
        },
    })
    res.status(200).json(data)
}
