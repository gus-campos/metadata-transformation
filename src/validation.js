import {
  allValidKeys,
  booleanMetaProps,
  dependantToExclusiveKeys,
  exclusiveKeys,
  sizeValidValues,
} from "./constants.js";

export function validateFieldsIdentifiers(metadataTransform, metadata) {
  const metadataFieldsIdentifiers = Object.keys(metadata.fields);

  const transformRootIdentifiers = Object.keys(metadataTransform);

  const fieldAndFieldsIdentifiers = transformRootIdentifiers.flatMap(
    (rootKey) => {
      const condChange = metadataTransform[rootKey];
      return [condChange._field, ...(condChange._fields ?? [])].filter(Boolean);
    },
  );

  const allTransformKeys = [
    ...transformRootIdentifiers,
    ...fieldAndFieldsIdentifiers,
  ];

  const invalidFieldIdentifiers = allTransformKeys.filter(
    (id) => !metadataFieldsIdentifiers.includes(id),
  );

  if (invalidFieldIdentifiers.length > 0)
    throw new Error(
      `Os seguintes identificadores foram usados mas não estão entre os campos do metadata: "${invalidFieldIdentifiers}"`,
    );
}

export function validateMetadataTransform(metadataTransform) {
  if (typeof metadataTransform !== "object")
    throw new Error("metadataTranform deve ser um objeto");

  for (const [identifier, conditionalChange] of Object.entries(
    metadataTransform,
  )) {
    validateConditionalChange(conditionalChange);
  }
}

export function validateConditionalChange(conditionalChange) {
  try {
    validateConditionalChangeHelper(conditionalChange);
  } catch (err) {
    if (err instanceof Error) {
      const obtainedMessage = `. Foi obtido: \n${JSON.stringify(conditionalChange, null, 2)}`;
      err.message += obtainedMessage;
    }

    throw err;
  }
}

function validateConditionalChangeHelper(conditionalChange) {
  if (typeof conditionalChange !== "object") {
    throw new Error("conditionalChange deve ser um objeto");
  }

  const keys = Object.keys(conditionalChange);

  // Busca por chaves inválidas

  const notValidKeys = keys.filter((key) => !allValidKeys.includes(key));
  if (notValidKeys.length > 0)
    throw new Error(`As seguintes chaves não são válidas: ${notValidKeys}`);

  // Validar chaves exclusivas

  const exclusiveKeysFound = keys.filter((key) => exclusiveKeys.includes(key));

  if (exclusiveKeysFound.length > 1)
    throw new Error(
      `Só pode ter uma das seguintes chaves: ${exclusiveKeysFound}`,
    );

  // Valida chaves dependentes

  if (exclusiveKeysFound.length === 1) {
    const exclusiveKey = exclusiveKeysFound[0];
    validateDependantKeysAndValues(exclusiveKey, conditionalChange);
  }

  validateFieldsTypes(conditionalChange);
}

function validateDependantKeysAndValues(exclusiveKey, conditionalChange) {
  if (exclusiveKey === "_if") {
    if (typeof conditionalChange._if !== "function")
      throw new Error("O predicato passado não é uma função");
  } else if (exclusiveKey === "_field" || exclusiveKey === "_fields") {
    validateDependantKeys(exclusiveKey, conditionalChange);
  } else {
    throw new Error(`Chave exclusiva inválida: ${exclusiveKey}`);
  }
}

function validateDependantKeys(exclusiveKey, conditionalChange) {
  const otherKey = exclusiveKey === "_field" ? "_fields" : "_field";

  const ownKeys = getFoundDependantKeysOf(exclusiveKey, conditionalChange);
  const otherKeys = getFoundDependantKeysOf(otherKey, conditionalChange);

  const ownKeysErrorMessage =
    ownKeys.length > 1
      ? `Estão presentes os seguintes campos de "${exclusiveKey}", enquanto deveria ter apenas um deles: ${ownKeys}`
      : ownKeys.length < 1
        ? `Não está presente nenhum dos campos de "${exclusiveKey}", que são: ${dependantToExclusiveKeys[exclusiveKey]}`
        : null;

  const notOwnedKeysErrorMessage =
    otherKeys.length > 0
      ? `Estão presentes os seguintes campos de "${otherKey}" em uma condição do tipo "${exclusiveKey}", enquanto não deveria ter nenhum: ${otherKeys}`
      : null;

  if (ownKeysErrorMessage || notOwnedKeysErrorMessage) {
    throw new Error(
      (ownKeysErrorMessage ?? "") + "\n" + (notOwnedKeysErrorMessage ?? ""),
    );
  }
}

function getFoundDependantKeysOf(exclusiveKey, conditionalChange) {
  const keys = Object.keys(conditionalChange);

  return keys.filter((key) =>
    dependantToExclusiveKeys[exclusiveKey].includes(key),
  );
}

function validateFieldsTypes(conditionalChange) {
  validateMetaPropsTypes(conditionalChange);

  // Não devem ser array -> TODO

  const fieldValue = conditionalChange._field;
  const someIsEqualValue = conditionalChange._someIs;
  const equalValue = conditionalChange._is;
  const notEqualValue = conditionalChange._isNot;

  if (fieldValue !== undefined && typeof fieldValue !== "string")
    throw new Error("_field deve ser uma string");

  if (someIsEqualValue !== undefined && Array.isArray(someIsEqualValue))
    throw new Error("_someIs não deve ser um array");

  if (equalValue !== undefined && Array.isArray(equalValue))
    throw new Error("_is não deve ser um array");

  if (notEqualValue !== undefined && Array.isArray(notEqualValue))
    throw new Error("_isNot não deve ser um array");

  // Devem ser arrays

  const isInValue = conditionalChange._isIn;
  const isNotInValue = conditionalChange._isNotIn;
  const fieldsValue = conditionalChange._fields;
  const equalsPairwiseValue = conditionalChange._are;

  const fieldsIsInvalid =
    fieldsValue !== undefined &&
    (!Array.isArray(fieldsValue) ||
      fieldsValue.some((fieldValue) => typeof fieldValue !== "string"));

  if (fieldsIsInvalid) {
    throw new Error("Fields deve ser um array de strings");
  }

  if (isInValue !== undefined && !Array.isArray(isInValue))
    throw new Error("_isIn deve ser um array de valores");

  if (isNotInValue !== undefined && !Array.isArray(isNotInValue))
    throw new Error("_isIn deve ser um array de valores");

  // Equals pairwise length
  if (equalsPairwiseValue !== undefined) {
    if (!Array.isArray(equalsPairwiseValue)) {
      throw new Error("_are deve ser um array de valores");
    }

    if (fieldsValue.length !== equalsPairwiseValue.length) {
      throw new Error("_fields e _are devem ter o mesmo tamanho");
    }
  }
}

function validateMetaPropsTypes(conditionalChange) {
  const keys = Object.keys(conditionalChange);

  const invalidBooleanProps = booleanMetaProps
    .filter((prop) => keys.includes(prop))
    .filter((prop) => typeof conditionalChange[prop] !== "boolean");

  if (invalidBooleanProps.length > 0)
    throw new Error(
      `As seguintes meta props deveriam ser do tipo boolean: "${invalidBooleanProps}"`,
    );

  const sizeValue = conditionalChange.size;
  if (keys.includes("size") && !sizeValidValues.includes(sizeValue)) {
    throw new Error(
      `"${sizeValue}" não é um valor válido para size. Os valores aceitos são "${sizeValidValues}"`,
    );
  }
}
