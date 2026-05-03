import { exclusiveKeys, metaPropsKeys } from "./constants.js";
import { areConditionsMet } from "./evaluation.js";
import { validateFieldsIdentifiers, validateMetadataTransform } from "./validation.js";
import { applyChange } from "./transformation.js";

export function processMetadata(metadataTransform, metadata, object) {
  validateFieldsIdentifiers(metadataTransform, metadata);
  validateMetadataTransform(metadataTransform, metadata);

  for (const [fieldIdentifier, conditionalChange] of Object.entries(
    metadataTransform,
  )) {
    const metadataField = metadata.fields[fieldIdentifier];
    processConditionalChange(metadataField, conditionalChange, object);
  }
}

function processConditionalChange(metadataField, conditionalChange, object) {
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

  // com propriedades e condições -> avalia pra aplicar
  if (areConditionsMet(conditionalChange, object))
    applyChange(metadataField, conditionalChange);
}
