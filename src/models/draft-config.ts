import z from "zod";
import { schema_value } from "./common";

export const ALL_VALID_DRAFT_CONFIG_KEYS = ["setValue"];

export const schema_draftConfig = z.object({
  setValue: schema_value,
});

export type DraftConfig = z.infer<typeof schema_draftConfig>;
