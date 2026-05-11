import { InstanceObject, Metadata } from "../models/commom";
import {
  Behavior,
  BehaviorConfig,
  BehaviorProps,
  LayoutConfig,
  MetadataConfig,
  SelectionConfig,
} from "../models/metadata-config";
import {
  ConditionalMetadata,
  FieldMetadataTransform,
  MetadataTransform,
  UnitMetadataCondition,
} from "../models/metadata-transform";
import { checkValueCondition } from "./check-value-condition";
import { conditionalValuekeys, metadataConfigKeys } from "./constants";
import { typedAssignValueToObject } from "./utils/extra";
import { throwToNotValidMetadataTransform } from "./validators";

let _object: InstanceObject;
let _metadata: Metadata;

export function transformMetadata(
  metadata: Metadata,
  object: InstanceObject,
  metadataTransform: unknown,
) {
  _metadata = metadata;
  _object = object;

  // Internamente lança erro se não for
  if (throwToNotValidMetadataTransform(metadataTransform))
    transformValidatedMetadata(metadata, object, metadataTransform);
}

export function transformValidatedMetadata(
  metadata: Metadata,
  object: InstanceObject,
  metadataTransform: MetadataTransform,
) {
  _metadata = metadata;
  _object = object;

  // espera que campos estejam validadosestar validado
  for (const [fieldIdentifier, fieldTransform] of Object.entries(
    metadataTransform,
  )) {
    processFieldTransform(fieldIdentifier, fieldTransform);
  }
}

function processFieldTransform(
  fieldIdentifier: string,
  fieldTransform: FieldMetadataTransform,
) {
  if (Array.isArray(fieldTransform)) {
    const conditionalMetadata: ConditionalMetadata[] = fieldTransform;

    for (const unitMetadataTransform of conditionalMetadata)
      processFieldTransform(fieldIdentifier, unitMetadataTransform);
    return;
  }

  if (conditionalValuekeys.some((key) => key in fieldTransform)) {
    const conditionalMetadata = fieldTransform as ConditionalMetadata;

    if (checkMetadataCondition(conditionalMetadata))
      applyMetadataConfig(fieldIdentifier, fieldTransform);
    return;
  }

  const metadataConfig: MetadataConfig = fieldTransform;
  applyMetadataConfig(fieldIdentifier, metadataConfig);
}

function checkMetadataCondition(unitCondition: UnitMetadataCondition): boolean {
  // Inútil por enquanto, mas deixa flexível para 
  // considerar condição composta futuramente
  return checkValueCondition(unitCondition, _object);
}

function applyMetadataConfig(
  fieldIdentifier: string,
  metadataConfig: MetadataConfig,
) {
  if (metadataConfigKeys.behavior.some((key) => key in metadataConfig)) {
    const behaviorConfig = metadataConfig as Behavior;
    applyBehavior(fieldIdentifier, behaviorConfig);
  }

  if (metadataConfigKeys.behaviorProps.some((key) => key in metadataConfig)) {
    const behaviorProps = metadataConfig as BehaviorProps;
    applyBehaviorProps(fieldIdentifier, behaviorProps);
  }

  if (metadataConfigKeys.layoutConfig.some((key) => key in metadataConfig)) {
    const layoutConfig = metadataConfig as LayoutConfig;
    applyLayoutConfig(fieldIdentifier, layoutConfig);
  }

  if (metadataConfigKeys.selectionConfig.some((key) => key in metadataConfig)) {
    const SelectionConfig = metadataConfig as SelectionConfig;
    applySelectionConfig(fieldIdentifier, SelectionConfig);
  }
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
  const keys = metadataConfigKeys.behaviorProps as (keyof BehaviorProps)[];

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
    // FIXME: if (!fieldMetadata.classRef) throw

    fieldMetadata.query = selectionConfig.query;
  }

  // Remove todos itens e adiciona novos (este array não pode ser reatribuído)
  if ("options" in selectionConfig && selectionConfig.options) {
    // FIXME: if (fieldMetadata.classRef) throw
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
  const layoutkeys = metadataConfigKeys.layoutConfig as (keyof LayoutConfig)[];

  for (const layoutKey of layoutkeys) {
    const value = layoutConfig[layoutKey];
    if (value === undefined) continue;
    typedAssignValueToObject(fieldMetadata, layoutKey, value);
  }
}
