import { PlainObject, Metadata } from "../models/common";
import {
  Behavior,
  BehaviorConfig,
  BehaviorProps,
  LayoutConfig,
  METADATA_CONFIG_KEYS,
  MetadataConfig,
  SelectionConfig,
} from "../models/metadata-config";
import {
  FieldMetadataTransform,
  MetadataTransform,
  UnitFieldMetadataTransform,
} from "../models/metadata-transform";
import {
  UnitValueCondition,
  VALUE_MAIN_KEYS,
  VALUE_SECONDARY_KEYS,
} from "../models/value-condition";
import { typedAssignValueToObject } from "../utils/typing";
import { assertMetadataTransform } from "../validation/metadata-transform";
import { checkValueCondition } from "./check-value-condition";
import { wrappedError } from "./wrap-error";

let _object: PlainObject;
let _metadata: Metadata;

export function transformMetadata(
  metadata: Metadata,
  object: PlainObject,
  metadataTransform: unknown,
) {
  _metadata = metadata;
  _object = object;

  if (assertMetadataTransform(metadataTransform, metadata))
    transformValidatedMetadata(metadata, object, metadataTransform);
}

export function transformValidatedMetadata(
  metadata: Metadata,
  object: PlainObject,
  metadataTransform: MetadataTransform,
) {
  _metadata = metadata;
  _object = object;

  for (const [fieldIdentifier, fieldTransform] of Object.entries(
    metadataTransform,
  ))
    processFieldTransform(fieldTransform, fieldIdentifier);
}

function processFieldTransform(
  fieldTransform: FieldMetadataTransform,
  fieldIdentifier: string,
) {
  if (Array.isArray(fieldTransform)) {
    for (const unitMetadataTransform of fieldTransform)
      processFieldTransform(unitMetadataTransform, fieldIdentifier);
    return;
  }

  let isConditionTruthy;

  try {
    isConditionTruthy = checkUnitFieldMetadataTransform(
      fieldTransform,
      fieldIdentifier,
    );
  } catch (err) {
    throw wrappedError(
      `Erro na verificação da condição na chave ${fieldIdentifier}`,
      err,
    );
  }

  if (isConditionTruthy) {
    applyMetadataConfig(fieldIdentifier, fieldTransform);
  }
}

function checkUnitFieldMetadataTransform(
  unitFieldTransform: UnitFieldMetadataTransform,
  fieldIdentifier: string,
): boolean {
  // checar se tem a condição

  const conditionKeys = [...VALUE_MAIN_KEYS, ...VALUE_SECONDARY_KEYS];

  if (!conditionKeys.some((key) => key in unitFieldTransform)) {
    return true;
  }

  return checkValueCondition(
    unitFieldTransform as UnitValueCondition,
    _object,
    fieldIdentifier,
  );
}

function applyMetadataConfig(
  fieldIdentifier: string,
  metadataConfig: MetadataConfig,
) {
  if (METADATA_CONFIG_KEYS.behavior.some((key) => key in metadataConfig))
    applyBehavior(fieldIdentifier, metadataConfig);

  if (METADATA_CONFIG_KEYS.behaviorProps.some((key) => key in metadataConfig))
    applyBehaviorProps(fieldIdentifier, metadataConfig);

  if (METADATA_CONFIG_KEYS.layoutConfig.some((key) => key in metadataConfig))
    applyLayoutConfig(fieldIdentifier, metadataConfig);

  if (METADATA_CONFIG_KEYS.selectionConfig.some((key) => key in metadataConfig))
    applySelectionConfig(fieldIdentifier, metadataConfig);
}

function applyBehavior(
  fieldIdentifier: string,
  behaviorConfig: BehaviorConfig,
) {
  if ("behavior" in behaviorConfig) {
    applyBehavior(fieldIdentifier, behaviorConfig);
    return;
  }

  applyBehaviorProps(fieldIdentifier, behaviorConfig);
}

function applyBehaviorProps(
  fieldIdentifier: string,
  behaviorProps: BehaviorProps,
) {
  const fieldMetadata = _metadata.fields[fieldIdentifier];
  const keys = METADATA_CONFIG_KEYS.behaviorProps as (keyof BehaviorProps)[];

  for (const behaviorPropKey of keys) {
    const value = behaviorProps[behaviorPropKey];
    if (value === undefined) continue;
    fieldMetadata[behaviorPropKey] = value;
  }
}

function applySelectionConfig(
  fieldIdentifier: string,
  selectionConfig: SelectionConfig,
) {
  const fieldMetadata = _metadata.fields[fieldIdentifier];

  if ("query" in selectionConfig && selectionConfig.query) {
    // FIXME: verificar se é referência
    fieldMetadata.query = selectionConfig.query;
  }

  // Remove todos itens e adiciona novos, já que este array não pode ser reatribuído
  if ("options" in selectionConfig && selectionConfig.options) {
    // FIXME: Verificar se é options
    fieldMetadata.options.splice(
      0,
      fieldMetadata.options.length,
      ...selectionConfig.options,
    );
  }
}

function applyLayoutConfig(
  fieldIdentifier: string,
  layoutConfig: LayoutConfig,
) {
  const fieldMetadata = _metadata.fields[fieldIdentifier];
  const layoutkeys =
    METADATA_CONFIG_KEYS.layoutConfig as (keyof LayoutConfig)[];

  for (const layoutKey of layoutkeys) {
    const value = layoutConfig[layoutKey];
    if (value === undefined) continue;
    typedAssignValueToObject(fieldMetadata, layoutKey, value);
  }
}
