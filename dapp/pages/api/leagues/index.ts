// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import { League } from ".prisma/client"
import prisma from "../../../lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse<League[]>) {
    const data = await prisma.league.findMany()
    res.status(200).json(data)
}
