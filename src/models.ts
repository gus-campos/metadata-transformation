type Value = string | number | null;

type ValueMatch = {
  [identifier: string]: Value;
};

type ValueCondition = {
  _not?: ValueCondition;
  _any?: ValueCondition;
  // Entre parenteses é só para satisfazer restrições do ts
  // Deve ser validado manualmente
  [identifier: string]: Value | (ValueCondition | undefined);
};

type FieldMetadataTransform = {
  _match: ValueCondition;
  _apply: {}
}

const fieldMetadataTransform: FieldMetadataTransform = {
  _match: {
    campo1: "valor1",
    _not: {
      campo2: null,
      _any: {
        campo3: null,
        campo4: 0,
      }
    }
  },
  _apply: {}
};
