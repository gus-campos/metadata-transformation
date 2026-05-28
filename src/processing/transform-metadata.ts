import { InstanceObject, Metadata } from "../models/pure/common";
import {
  FieldMetadataTransform,
  MetadataTransform,
} from "../models/pure/metadata-transform";
import { accessPathInObject } from "../utils/path-access";
import { applyMetadata } from "./apply-metadata";
import { checkMatchCondition } from "./check-match-condition";

type FieldMetadataContext = {
  metadata: Metadata;
  instance: InstanceObject;
  fieldIdentifier: string;
};

export function transformMetadata(
  metadata: Metadata,
  instance: InstanceObject,
  metadataTransform: MetadataTransform,
) {
  // Para campo e sua transformação

  for (const [fieldIdentifier, fieldTransforms] of Object.entries(
    metadataTransform,
  )) {

    for (const fieldTransform of fieldTransforms)
    transformMetadataField(
      { metadata, instance, fieldIdentifier },
      fieldTransform,
    );
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

  const isIfTruthy = !_if ? true : _if(fieldValue, context.instance);

  if (_apply && isMatchTruthy && isIfTruthy)
    applyMetadata(context.metadata, context.fieldIdentifier, _apply);
}
