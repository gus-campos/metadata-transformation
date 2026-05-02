export const metaPropsKeys = ["readonly", "required", "hidden", "breakLine", "size"];
export const booleanMetaProps = ["readonly", "required", "hidden", "breakLine"];
export const sizeValidValues = ["sm", "md", "lg"];
export const exclusiveKeys = ["_field", "_fields", "_if"];
export const dependantToExclusiveKeys = {
  _field: ["_is", "_isNot", "_isIn"],
  _fields: ["_are", "_someIs"],
  _if: [],
};

export const allValidKeys = [
  ...metaPropsKeys,
  ...exclusiveKeys,
  ...exclusiveKeys.flatMap((key) => dependantToExclusiveKeys[key]),
];
