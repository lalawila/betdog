import { builder } from "../builder"

builder.prismaObject("Game", {
    fields: (t) => ({
        id: t.exposeID("id"),
    }),
})
