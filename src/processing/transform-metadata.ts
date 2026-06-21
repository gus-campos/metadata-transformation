import { InstanceObject, Metadata } from "../models/pure/common";
import {
    FieldMetadataTransform,
    FieldsMetadataTransform
} from "../models/pure/metadata-transform";
import { accessPathInObject } from "../utils/path-access";
import { applyMetadata } from "./apply-metadata";
import { checkMatchCondition } from "./check-match-condition";

type MetadataContext = {
    metadata: Metadata;
    instance: InstanceObject;
};

type FieldMetadataContext = MetadataContext & {
    fieldIdentifier: string;
};

export function transformMetadata(
    metadata: Metadata,
    instance: InstanceObject,
    fieldsMetadataTransform: FieldsMetadataTransform | null = null
) {
    // Para campo e sua transformação

    if (fieldsMetadataTransform) {
        for (const [fieldIdentifier, fieldTransforms] of Object.entries(
            fieldsMetadataTransform,
        )) {
            for (const fieldTransform of fieldTransforms)
                transformMetadataField(
                    { metadata, instance, fieldIdentifier },
                    fieldTransform,
                );
        }
    }
}

export function transformMetadataField(
    context: FieldMetadataContext,
    fieldTransform: FieldMetadataTransform,
) {
    const { _if, _match, _apply } = fieldTransform;

    // Verificar mesmo que não tenha condição para aplicar
    // pra manter consistência no fluxo de erros e execuções

    const isMatchTruthy = !_match
        ? true
        : checkMatchCondition(context.instance, _match);

    const fieldValue = accessPathInObject(
        context.instance,
        context.fieldIdentifier,
    );

    const isIfTruthy = !_if
        ? true
        : _if({ value: fieldValue, obj: context.instance });

    if (!_apply || !isMatchTruthy || !isIfTruthy) return;

    applyMetadata(context.metadata, context.fieldIdentifier, _apply);
}