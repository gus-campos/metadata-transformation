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
  FieldMetadataContext,
  FieldMetadataTransform,
  MetadataContext,
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



export function transformMetadata(
  metadataTransform: unknown,
  metadataContext: MetadataContext,
) {
  if (assertMetadataTransform(metadataTransform, metadataContext.metadata))
    transformValidatedMetadata(metadataTransform, metadataContext);
}

export function transformValidatedMetadata(
  metadataTransform: MetadataTransform,
  metadataContext: MetadataContext,
) {
  for (const [fieldIdentifier, fieldTransform] of Object.entries(
    metadataTransform,
  ))
    processFieldTransform(fieldTransform, {
      fieldIdentifier,
      ...metadataContext,
    });
}

function processFieldTransform(
  fieldTransform: FieldMetadataTransform,
  fieldContext: FieldMetadataContext,
) {
  if (Array.isArray(fieldTransform)) {
    for (const unitMetadataTransform of fieldTransform)
      processFieldTransform(unitMetadataTransform, fieldContext);
    return;
  }

  let isConditionTruthy;

  try {
    isConditionTruthy = checkUnitFieldMetadataTransform(
      fieldTransform,
      fieldContext,
    );
  } catch (err) {
    throw wrappedError(
      `Erro na verificação da condição na chave ${fieldContext.fieldIdentifier}`,
      err,
    );
  }

  if (isConditionTruthy) {
    applyMetadataConfig(fieldTransform, fieldContext);
  }
}

function checkUnitFieldMetadataTransform(
  unitFieldTransform: UnitFieldMetadataTransform,
  fieldContext: FieldMetadataContext,
): boolean {
  const conditionKeys = [...VALUE_MAIN_KEYS, ...VALUE_SECONDARY_KEYS];

  if (!conditionKeys.some((key) => key in unitFieldTransform)) {
    return true;
  }

  return checkValueCondition(
    unitFieldTransform as UnitValueCondition,
    fieldContext.object,
    fieldContext.fieldIdentifier,
  );
}

function applyMetadataConfig(
  metadataConfig: MetadataConfig,
  fieldContext: FieldMetadataContext,
) {
  if (METADATA_CONFIG_KEYS.behavior.some((key) => key in metadataConfig))
    applyBehavior(metadataConfig, fieldContext);

  if (METADATA_CONFIG_KEYS.behaviorProps.some((key) => key in metadataConfig))
    applyBehaviorProps(metadataConfig, fieldContext);

  if (METADATA_CONFIG_KEYS.layoutConfig.some((key) => key in metadataConfig))
    applyLayoutConfig(metadataConfig, fieldContext);

  if (METADATA_CONFIG_KEYS.selectionConfig.some((key) => key in metadataConfig))
    applySelectionConfig(metadataConfig, fieldContext);
}

function applyBehavior(
  behaviorConfig: BehaviorConfig,
  fieldContext: FieldMetadataContext,
) {
  if ("behavior" in behaviorConfig) {
    applyBehavior(behaviorConfig, fieldContext);
    return;
  }

  applyBehaviorProps(behaviorConfig, fieldContext);
}

function applyBehaviorProps(
  behaviorProps: BehaviorProps,
  fieldContext: FieldMetadataContext,
) {
  const fieldMetadata =
    fieldContext.metadata.fields[fieldContext.fieldIdentifier];
  const keys = METADATA_CONFIG_KEYS.behaviorProps as (keyof BehaviorProps)[];

  for (const behaviorPropKey of keys) {
    const value = behaviorProps[behaviorPropKey];
    if (value === undefined) continue;
    fieldMetadata[behaviorPropKey] = value;
  }
}

function applySelectionConfig(
  selectionConfig: SelectionConfig,
  fieldContext: FieldMetadataContext,
) {
  const fieldMetadata =
    fieldContext.metadata.fields[fieldContext.fieldIdentifier];

  if ("query" in selectionConfig && selectionConfig.query) {
    // FIXME: verificar se é referência
    fieldMetadata.query = selectionConfig.query;
  }

  // Remove todos itens e adiciona novos, já que este array não pode ser reatribuído
  if ("valueOptions" in selectionConfig && selectionConfig.valueOptions) {
    // FIXME: Verificar se é options
    fieldMetadata.valueOptions.splice(
      0,
      fieldMetadata.valueOptions.length,
      ...selectionConfig.valueOptions,
    );
  }
}

function applyLayoutConfig(
  layoutConfig: LayoutConfig,
  fieldContext: FieldMetadataContext,
) {
  const fieldMetadata =
    fieldContext.metadata.fields[fieldContext.fieldIdentifier];

  const layoutkeys =
    METADATA_CONFIG_KEYS.layoutConfig as (keyof LayoutConfig)[];

  for (const layoutKey of layoutkeys) {
    const value = layoutConfig[layoutKey];
    if (value === undefined) continue;
    typedAssignValueToObject(fieldMetadata, layoutKey, value);
  }
}
