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
  | (FieldId & { equal: Value })
  | (FieldId & { notEqual: Value })
  | (FieldId & { some: Value[] })
  | (FieldsIds & { equals: Value[] })
  | (FieldsIds & { includes: Value })
  | { predicate: (object: any) => boolean };

type ConditionalChange = Condition & MetaProps;
// type ConditionalChange = { conditions: Condition[], changes: MetaProps };

// quando field ausente, mas critério de field presente
// pode considerar ele mesmo -> preprocessamente
// Validar se some e equals é array, equals do memso valor 