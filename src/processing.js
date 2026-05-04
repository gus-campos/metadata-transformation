import {
  allNonMetaKeys,
  dependantToExclusiveKeys,
  exclusiveKeys,
  metaPropsKeys,
} from "./constants.js";
import { areConditionsMet } from "./evaluation.js";
import {
  validateFieldsIdentifiers,
  validateMetadataTransform,
} from "./validation.js";
import { applyChange } from "./transformation.js";

export function processMetadata(metadataTransform, metadata, object) {
  preprocessMetadataTransform(metadataTransform);
  validateFieldsIdentifiers(metadataTransform, metadata);
  validateMetadataTransform(metadataTransform, metadata);

  for (const [fieldIdentifier, conditionalChange] of Object.entries(
    metadataTransform,
  )) {
    const metadataField = metadata.fields[fieldIdentifier];
    if (Array.isArray(conditionalChange)) {
      conditionalChange.forEach((unitConditionalChange) =>
        processConditionalChange(metadataField, unitConditionalChange, object),
      );
    } else {
      processConditionalChange(metadataField, conditionalChange, object);
    }
  }
}

function processConditionalChange(metadataField, conditionalChange, object) {
  const keys = Object.keys(conditionalChange);

  // vazio -> ignora
  if (keys.length === 0) return;

  // sem propriedades -> ignora
  const metaPropsKeysFound = keys.filter((key) => metaPropsKeys.includes(key));
  if (metaPropsKeysFound === 0) return;

  // sem nenhuma chave que significa checagem -> aplica
  const exclusiveKeysFound = keys.filter((key) => allNonMetaKeys.includes(key));
  if (exclusiveKeysFound.length === 0)
    applyChange(metadataFields, conditionalChange);

  // com propriedades e condições -> avalia pra aplicar
  if (areConditionsMet(conditionalChange, object))
    applyChange(metadataField, conditionalChange);
}

function preprocessMetadataTransform(metadataTransform) {
  
  for (const [fieldIdentifier, conditionalChange] of Object.entries(
    metadataTransform,
  )) {

    if (Array.isArray(conditionalChange)) {
      conditionalChange.forEach((unitCondicionalChange) =>
        preprocessConditionalChange(fieldIdentifier, unitCondicionalChange),
      );
      continue;
    }

    preprocessConditionalChange(fieldIdentifier, conditionalChange);
  }
}

function preprocessConditionalChange(fieldIdentifier, conditionalChange) {
  const keys = Object.keys(conditionalChange);
  

  const exclusiveKeysIncluded = keys.filter((key) =>
    exclusiveKeys.includes(key),
  );

  if (exclusiveKeysIncluded.length > 0) return;

  const keysDependantToFieldFound = keys.map((key) =>
    dependantToExclusiveKeys._field.includes(key),
  );

  if (keysDependantToFieldFound.length === 0) return;

  // Usa field implicitamente, então incluir explicitamente
  conditionalChange._field = fieldIdentifier;
}
