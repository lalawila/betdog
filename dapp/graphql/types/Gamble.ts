import prisma from "#/lib/prisma"
import { builder } from "../builder"

builder.prismaObject("Gamble", {
    fields: (t) => ({
        id: t.exposeID("id"),
        name: t.exposeString("name"),
        contractId: t.exposeInt("contractId"),
        outcomes: t.exposeStringList("outcomes"),
    }),
})
