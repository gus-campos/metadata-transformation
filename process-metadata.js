const metaPropsKeys = ["readonly", "required", "hidden", "breakLine", "size"];
const exclusiveKeys = ["field", "fields", "predicate"];
const dependantToExclusiveKeys = {
  field: ["equal", "notEqual", "some"],
  fields: ["equals", "includes"],
  predicate: [],
};

const allValidKeys = [
  ...metaPropsKeys,
  ...exclusiveKeys,
  ...exclusiveKeys.flatMap((key) => dependantToExclusiveKeys[key]),
];

let _metadata;
let _metadataTransform;
let _object;

export function processMetadata(metadata, metadataTransform, object) {
  if (typeof metadataTransform !== "object")
    throw new Error("metadataTranform deve ser um objeto");

  _metadata = metadata;
  _metadataTransform = metadataTransform;
  _object = object;

  for (const [identifier, conditionalChange] of Object.entries(
    metadataTransform,
  )) {
    processConditionalChange(identifier, conditionalChange);
  }
}

function processConditionalChange(identifier, conditionalChange) {
  validateConditionalChange(conditionalChange);

  const keys = Object.keys(conditionalChange);

  // vazio -> ignora
  if (keys.length === 0) return;

  // sem propriedades -> ignora
  const metaPropsKeysFound = keys.filter((key) => metaPropsKeys.includes(key));
  if (metaPropsKeysFound === 0) return;

  // sem condições -> aplica
  const exclusiveKeysFound = keys.filter((key) => exclusiveKeys.includes(key));
  if (exclusiveKeysFound.length === 0) applyChange(identifier, conditionalChange);

  // com propriedades e condições -> avalia
  if (areConditionsMet(conditionalChange)) applyChange;
}

function applyChange(identifier, conditionalChange) {
  
  const metaPropsEntries = Object.entries(conditionalChange).filter(
    ([key, _]) => metaPropsKeys.includes(key),
  );

  for (const [property, value] of Object.entries(metaPropsEntries)) {
    _metadata.fields[identifier][property] = value;
  }
}

// console.log(`${identifier}-${property}-${value}`);

// Avaliações

function areConditionsMet(conditionalChange) {
  const keys = Object.keys(conditionalChange);

  const exclusiveKey = keys.find((key) => exclusiveKeys.includes(key));

  switch (exclusiveKey) {
    case "field":
      return evaluateFieldCondition(conditionalChange);

    case "fields":
      return evaluateFieldsCondition(conditionalChange);

    case "predicate":
      return evaluatePredicateCondition(conditionalChange);
  }
}

function evaluateFieldCondition(conditionalChange) {

  const keys = Object.keys(conditionalChange);

  const dependantKey = keys.find((key) => exclusiveKeys.includes(key));

  switch (dependantKey) {
    case "equal":
      const valueExpected = conditionalChange.equal;
      const valueGot1 = _object[conditionalChange.field];
      return valueExpected === valueGot1;

    case "notEqual":
      const valueNotExpected = conditionalChange.notEqual;
      const valueGot2 = _object[conditionalChange.field];
      return valueExpected !== valueGot2;

    case "some":
      const criteriaValues = conditionalChange.some;
      const valueGot = _object[conditionalChange.field];
      return criteriaValues.includes(valueGot);
  }
}

function evaluateFieldsCondition(conditionalChange) {
  const dependantKey = keys.find((key) => exclusiveKeys.includes(key));
}

function evaluatePredicateCondition(conditionalChange) {
  const dependantKey = keys.find((key) => exclusiveKeys.includes(key));
}

// Validação

function validateConditionalChange(conditionalChange) {
  if (typeof conditionalChange !== "object")
    throw new Error("conditionalChange deve ser um objeto");

  const keys = Object.keys(conditionalChange);

  // Busca por chaves inválidas

  const notValidKeys = keys.filter((key) => !allValidKeys.includes(key));
  if (notValidKeys.length > 0)
    throw new Error(`As seguintes chaves não são válidas ${notValidKeys}`);

  // Chaves Exclusivas

  const exclusiveKeysFound = keys.filter((key) => exclusiveKeys.includes(key));

  if (exclusiveKeysFound.length > 1)
    throw new Error(
      `Só pode ter uma das seguintes chaves ${exclusiveKeysFound}`,
    );

  if (exclusiveKeysFound.length === 1) {
    const exclusiveKey = keys[0];

    validateDependantKeys(exclusiveKey, keys);

    // Validar predicato

    if (exclusiveKey === "predicate") {
      const isInvalidPredicate =
        typeof conditionalChange.predicate !== "function";
      if (isInvalidPredicate)
        throw new Error("O predicato passado não é uma função");
    }
  }
}

// console.log(JSON.stringify(amountOfExclusiveKeysFields, null, 2));

function validateDependantKeys(fieldKey, keys) {

  const getAmountOfDependantField = (exclusiveKey) => keys.filter(key => dependantToExclusiveKeys[exclusiveKey].includes(key)).length;

  const amountOfExclusiveKeysFields = {
    field: getAmountOfDependantField("field"),
    fields: getAmountOfDependantField("fields"),
    predicate: getAmountOfDependantField("predicate"),
  };


  for (const [field, amount] of Object.entries(amountOfExclusiveKeysFields)) {
    // Predicato deve ter 0 chaves exclusivas
    // Os outros exatamente 1, do seu próprio tipo
    const ownKey = field === fieldKey;
    const expectedAmount = !ownKey || field === "predicate" ? 0 : 1;
    if (amount !== expectedAmount) throw new Error("Quantidade incorreta"); // TODO: Melhorar mensagem
  }
}
