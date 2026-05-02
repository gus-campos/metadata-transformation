export const metaPropsKeys = ["readonly", "required", "hidden", "breakLine", "size"];
export const booleanMetaProps = ["readonly", "required", "hidden", "breakLine"];
export const sizeValidValues = ["sm", "md", "lg"];
export const exclusiveKeys = ["field", "fields", "rule"];
export const dependantToExclusiveKeys = {
  field: ["equal", "notEqual", "oneOf"],
  fields: ["equalsPairwise", "someIsEqual"],
  rule: [],
};

export const allValidKeys = [
  ...metaPropsKeys,
  ...exclusiveKeys,
  ...exclusiveKeys.flatMap((key) => dependantToExclusiveKeys[key]),
];
