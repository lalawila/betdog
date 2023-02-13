import prisma from "@/lib/prisma"
import { builder } from "../builder"

builder.prismaObject("Game", {
    fields: (t) => ({
        id: t.exposeID("id"),
        timestamp: t.exposeInt("timestamp"),
        home: t.relation("home"),
        away: t.relation("away"),
    }),
})

// 1.
builder.queryField("games", (t) =>
    // 2.
    t.prismaField({
        // 3.
        type: ["Game"],
        // 4.
        resolve: (query, _parent, _args, _ctx, _info) => prisma.game.findMany({ ...query }),
    }),
)
