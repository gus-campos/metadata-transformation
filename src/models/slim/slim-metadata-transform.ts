import {
  FieldMetadataTransform,
  FieldsApply,
  FieldsMetadataTransform,
  RuleMetadataTransform,
  RulesMetadataTransform,
} from "../pure/metadata-transform";
import { TermProps, SlimApplyObject, toApply } from "./slim-apply";
import {
  SlimImplicitMatchCondition,
  SlimMatch,
  toMatchCondition,
} from "./slim-match";

type SlimFieldMetadataTransform = FieldMetadataTransform &
  SlimImplicitMatchCondition &
  SlimApplyObject;

export type SlimMetadataTransform = {
  [fieldIdentifier: string]:
    | SlimFieldMetadataTransform
    | SlimFieldMetadataTransform[];
};

// ======================== RulesMetadataTransform ========================

export type SlimFieldsApply = {
  _apply: {
    [fieldIdentifier: string]: TermProps | SlimApplyObject;
  };
};

// ======================== Converters ========================

export function toFieldsMetadataTransform(
  transform: SlimMetadataTransform,
): FieldsMetadataTransform {
  const simpleTransform = {} as FieldsMetadataTransform;

  for (const [fieldIdentifier, fieldTransform] of Object.entries(transform)) {
    const fieldTransformArray = Array.isArray(fieldTransform)
      ? fieldTransform
      : [fieldTransform];

    simpleTransform[fieldIdentifier] = fieldTransformArray.map((transform) =>
      toFieldMetadataTransform(transform, fieldIdentifier),
    );
  }

  return simpleTransform;
}

function toFieldMetadataTransform(
  fieldTransform: SlimFieldMetadataTransform,
  fieldIdentifier: string,
): FieldMetadataTransform {
  const apply = toApply(fieldTransform);
  const match = toMatchCondition(fieldTransform, fieldIdentifier);
  return {
    ...fieldTransform,
    ...(apply && { _apply: apply }),
    ...(match && { _match: match }),
  };
}
