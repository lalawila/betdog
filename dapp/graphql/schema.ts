// graphql/schema.ts

import { builder } from "./builder"
import "./types/Game"
import "./types/Team"

export const schema = builder.toSchema()
