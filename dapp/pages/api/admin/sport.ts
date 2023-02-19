// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "#/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const sport = await prisma.sport.create({
            data: {
                categoryId: req.body.categoryId,
                name: req.body.name,
            },
        })

        res.status(200).json({
            sportId: sport.id,
        })
    }
}
