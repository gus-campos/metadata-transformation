type MetadataTransform = Record<string, MetaProps | ConditionalChange>;

type MetaProps = {
  readonly?: boolean;
  required?: boolean;
  hidden?: boolean;
  breakLine?: boolean;
  size?: "sm" | "md" | "lg";
};

type Value = boolean | string | Date | null;

type FieldId = { field: string };
type FieldsIds = { fields: string[] };

type Condition =
  | (FieldId & { equal: Value }) // permitir array?
  | (FieldId & { notEqual: Value })
  | (FieldId & { oneOf: Value[] })
  | (FieldsIds & { equalsPairwise: Value[] })
  | (FieldsIds & { someIsEqual: Value })
  | { rule: (object: any) => boolean }; 

type ConditionalChange = Condition & MetaProps;
// Futuro: type ConditionalChange = { conditions: Condition[], changes: MetaProps };

// TODO: Quando field ausente, mas critério de field presente
  //  pode considerar ele mesmo -> preprocessamente
