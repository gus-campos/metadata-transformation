import { FieldMetadataTransform } from "../pure/metadata-transform";
import { ShortcuttedApply, toApply } from "./shortcutted-apply";

type ShortcuttedFieldMetadataTransform = FieldMetadataTransform & ShortcuttedApply;

export type ShortcuttedMetadataTransform = {
  [fieldIdentifier: string]: ShortcuttedFieldMetadataTransform | ShortcuttedFieldMetadataTransform[];
};

function toMetadataTransform(transform: ShortcuttedMetadataTransform): FieldMetadataTransform {

    for (const [key, fieldTransform] of Object.entries(transform)) {

        const newFieldTransform = Array.isArray(fieldTransform) ? fieldTransform : [fieldTransform];
    }
}

function toFieldTransform(fieldTransform: ShortcuttedFieldMetadataTransform): FieldMetadataTransform {
    return { ...fieldTransform, ...toApply(fieldTransform) };
}