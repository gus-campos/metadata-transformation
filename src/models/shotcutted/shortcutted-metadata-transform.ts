import {
  Apply,
  FieldMetadataTransform,
  MetadataTransform,
} from "../pure/metadata-transform";
import { ShortcuttedApply, toApply } from "./shortcutted-apply";

type ShortcuttedFieldMetadataTransform = FieldMetadataTransform &
  ShortcuttedApply;

export type ShortcuttedMetadataTransform = {
  [fieldIdentifier: string]:
    | ShortcuttedFieldMetadataTransform
    | ShortcuttedFieldMetadataTransform[];
};

export function toMetadataTransform(
  transform: ShortcuttedMetadataTransform,
): MetadataTransform {
  const simpleTransform = {} as MetadataTransform;

  for (const [key, fieldTransform] of Object.entries(transform)) {
    const fieldTransformArray = Array.isArray(fieldTransform)
      ? fieldTransform
      : [fieldTransform];

    simpleTransform[key] = fieldTransformArray.map(toFieldTransform);
  }

  return simpleTransform;
}

function toFieldTransform(
  fieldTransform: ShortcuttedFieldMetadataTransform,
): FieldMetadataTransform {
    
  return {
    ...fieldTransform,
    ...toApply(fieldTransform),
  };
}
