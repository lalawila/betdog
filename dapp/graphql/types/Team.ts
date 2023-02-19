import prisma from "#/lib/prisma"
import { builder } from "../builder"

builder.prismaObject("Team", {
    fields: (t) => ({
        id: t.exposeID("id"),
        name: t.exposeString("name"),
    }),
})

// 1.
builder.queryField("teams", (t) =>
    // 2.
    t.prismaField({
        // 3.
        type: ["Team"],
        // 4.
        resolve: (query, _parent, _args, _ctx, _info) => prisma.team.findMany({ ...query }),
    }),
)
