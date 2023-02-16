// graphql/schema.ts

import { builder } from "./builder"
import "./types/Game"
import "./types/Team"
import "./types/Gamble"

export const schema = builder.toSchema()
