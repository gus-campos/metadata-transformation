import {
  FieldMetadataTransform,
  MetadataTransform,
} from "../pure/metadata-transform";
import { SlimApply, toApply } from "./slim-apply";
import { toMatchCondition } from "./slim-match";

type SlimFieldMetadataTransform = FieldMetadataTransform & SlimApply;

export type SlimMetadataTransform = {
  [fieldIdentifier: string]:
    | SlimFieldMetadataTransform
    | SlimFieldMetadataTransform[];
};

// TODO: Falta implementar campos múltiplos
// TODO: Falta implementar agrupamento por regras
// criar um novo argumento opcional no transformMetada?
// sempre executar depois

export function toMetadataTransform(
  transform: SlimMetadataTransform,
): MetadataTransform {
  const simpleTransform = {} as MetadataTransform;

  for (const [fieldIdentifier, fieldTransform] of Object.entries(transform)) {
    const fieldTransformArray = Array.isArray(fieldTransform)
      ? fieldTransform
      : [fieldTransform];

    simpleTransform[fieldIdentifier] = fieldTransformArray.map((transform) =>
      toFieldTransform(transform, fieldIdentifier),
    );
  }

  return simpleTransform;
}

function toFieldTransform(
  fieldTransform: SlimFieldMetadataTransform, fieldIdentifier: string
): FieldMetadataTransform {
  return {
    ...fieldTransform,
    ...toApply(fieldTransform),
    ...toMatchCondition(fieldTransform, fieldIdentifier),
  };
}
