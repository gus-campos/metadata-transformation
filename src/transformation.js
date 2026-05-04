import { metaPropsKeys } from "./constants.js";

export function applyChange(metadataFields, conditionalChange) {
  const metaPropsEntries = Object.entries(conditionalChange).filter(
    ([key, _]) => metaPropsKeys.includes(key),
  );

  for (const [property, value] of metaPropsEntries)
    metadataFields[property] = value;
}
