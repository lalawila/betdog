// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

import { Category } from ".prisma/client"
import prisma from "#/lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse<Category[]>) {
    const data = await prisma.category.findMany()
    res.status(200).json(data)
}
