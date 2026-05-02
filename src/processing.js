import { exclusiveKeys, metaPropsKeys } from "./constants.js";
import { areConditionsMet } from "./evaluation.js";
import { validateMetadataTransform } from "./validation.js";
import { applyChange } from "./transformation.js";

export function processMetadata(metadata, metadataTransform, object) {
  validateMetadataTransform(metadataTransform, metadata);

  for (const [fieldIdentifier, conditionalChange] of Object.entries(
    metadataTransform,
  )) {
    const metadataFields = metadata._fields[fieldIdentifier];
    processConditionalChange(metadataFields, conditionalChange, object);
  }
}

function processConditionalChange(metadataFields, conditionalChange, object) {
  const keys = Object.keys(conditionalChange);

  // vazio -> ignora
  if (keys.length === 0) return;

  // sem propriedades -> ignora
  const metaPropsKeysFound = keys.filter((key) => metaPropsKeys.includes(key));
  if (metaPropsKeysFound === 0) return;

  

  // sem condições -> aplica
  const exclusiveKeysFound = keys.filter((key) => exclusiveKeys.includes(key));
  if (exclusiveKeysFound.length === 0)
    applyChange(metadataFields, conditionalChange);

  // com propriedades e condições -> avalia
  if (areConditionsMet(conditionalChange, object))
    applyChange(metadataFields, conditionalChange);
}
