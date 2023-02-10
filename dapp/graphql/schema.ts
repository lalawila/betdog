// graphql/schema.ts

import { builder } from "./builder"
import "./types/Game"

export const schema = builder.toSchema()
