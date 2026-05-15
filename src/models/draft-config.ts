import z from "zod";
import { schema_value } from "./common";

export const schema_draftConfig = z.object({
    setValue: schema_value
});

export type DraftConfig = z.infer<typeof schema_draftConfig>;