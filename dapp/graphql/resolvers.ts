// /graphql/resolvers.ts
import prisma from "../lib/prisma"
export const resolvers = {
    Query: {
        games: () => {
            return prisma.game.findMany()
        },
    },
}
