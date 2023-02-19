import prisma from "#/lib/prisma"
import { builder } from "../builder"

builder.prismaObject("Game", {
    fields: (t) => ({
        id: t.exposeID("id"),
        timestamp: t.exposeInt("timestamp"),
        home: t.relation("home"),
        away: t.relation("away"),
        gambles: t.relation("Gamble"),
    }),
})

builder.queryField("games", (t) =>
    t.prismaField({
        type: ["Game"],
        resolve: (query, _parent, _args, _ctx, _info) => prisma.game.findMany({ ...query }),
    }),
)
