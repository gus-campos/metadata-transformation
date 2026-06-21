import {
  FieldMetadataTransform,
  FieldsMetadataTransform,
} from "../pure/metadata-transform";
import { TermProps, SlimApplyObject, toApply, SlimApply } from "./slim-apply";
import { SlimImplicitMatch, toMatch } from "./slim-match";

type SlimFieldMetadataTransform = FieldMetadataTransform & {
  _match?: SlimImplicitMatch;
  _apply?: SlimApply;
};

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
  const apply = fieldTransform._apply ? toApply(fieldTransform._apply) : null;

  const match = fieldTransform._match
    ? toMatch(fieldTransform._match, fieldIdentifier)
    : null;

  return {
    ...fieldTransform,
    ...(apply && { _apply: apply }),
    ...(match && { _match: match }),
  };
}
