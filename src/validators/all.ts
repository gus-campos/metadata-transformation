import type { Value, InstanceObject, Metadata } from "../models/common";

import type {
  Behavior,
  BehaviorProps,
  BehaviorConfig,
  LayoutConfig,
  SelectOption,
  SelectOptions,
  SelectionConfig,
  MetadataProps,
  MetadataConfig,
} from "../models/metadata-config";

import type {
  FieldId,
  FieldsIds,
  ValueConditionIs,
  ValueConditionIsNot,
  ValueConditionIsIn,
  ValueConditionIsNotIn,
  ValueConditionAre,
  ValueConditionSomeIs,
  ValueConditionIf,
  UnitValueCondition,
} from "../models/value-condition";

import type { UnitChangedCondition } from "../models/changed-condition";
import type { UnitDraftCondition } from "../models/draft-condition";
import type { DraftConfig } from "../models/draft-config";

import type {
  ConditionalValueSet,
  FieldDraftTransform,
  DraftTransform,
} from "../models/draft-transform";

import type {
  ConditionalMetadata,
  FieldMetadataTransform,
  MetadataTransform,
} from "../models/metadata-transform";

// ─── Infraestrutura ───────────────────────────────────────────────────────────

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function fail(expected: string, received: unknown): never {
  throw new ValidationError(`${expected}\n  Recebido: ${serialize(received)}`);
}

function serialize(val: unknown): string {
  try {
    return JSON.stringify(
      val,
      (_k, v) => (typeof v === "function" ? "[Function]" : v),
      2,
    );
  } catch {
    return String(val);
  }
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return (
    typeof val === "object" &&
    val !== null &&
    !Array.isArray(val) &&
    !(val instanceof Date)
  );
}

// ─── Constantes de discriminante ──────────────────────────────────────────────

const BEHAVIOR_VALUES = [
  "omitted",
  "mandatory",
  "editable",
  "displayed",
] as const;

const BEHAVIOR_PROP_KEYS = ["readonly", "required", "hidden"] as const;

const SIZE_VALUES = ["sm", "md", "lg"] as const;

const VALUE_CONDITION_KEYS = [
  "_is",
  "_isNot",
  "_isIn",
  "_isNotIn",
  "_are",
  "_someIs",
  "_if",
] as const;
type ValueConditionKey = (typeof VALUE_CONDITION_KEYS)[number];

const CHANGED_CONDITION_KEYS = [
  "_fieldChanged",
  "_someFieldChanged",
  "_if",
] as const;
type ChangedConditionKey = (typeof CHANGED_CONDITION_KEYS)[number];

// ─── Value ────────────────────────────────────────────────────────────────────

export function assertValue(candidate: unknown): candidate is Value {
  if (
    candidate === null ||
    typeof candidate === "boolean" ||
    typeof candidate === "string" ||
    candidate instanceof Date
  ) {
    return true;
  }

  if (isPlainObject(candidate)) {
    for (const [key, val] of Object.entries(candidate)) {
      try {
        assertValue(val);
      } catch (e) {
        throw new ValidationError(
          `Value inválido na chave '${key}': ${(e as Error).message}`,
        );
      }
    }
    return true;
  }

  return fail(
    `Esperado: Value\n` +
      `  Tipos válidos: InstanceObject | boolean | string | Date | null`,
    candidate,
  );
}

export function assertInstanceObject(
  candidate: unknown,
): candidate is InstanceObject {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: InstanceObject\n  Formato: { [key: string]: Value }`,
      candidate,
    );
  }

  for (const [key, val] of Object.entries(candidate)) {
    try {
      assertValue(val);
    } catch (e) {
      throw new ValidationError(
        `InstanceObject: valor inválido na chave '${key}': ${(e as Error).message}`,
      );
    }
  }

  return true;
}

// ─── Behavior ─────────────────────────────────────────────────────────────────

export function assertBehavior(candidate: unknown): candidate is Behavior {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: Behavior\n  Formato: { behavior: "${BEHAVIOR_VALUES.join('" | "')}" }`,
      candidate,
    );
  }

  if (!("behavior" in candidate)) {
    return fail(
      `Esperado: Behavior — campo 'behavior' ausente\n` +
        `  Valores válidos: ${BEHAVIOR_VALUES.map((v) => `"${v}"`).join(" | ")}`,
      candidate,
    );
  }

  if (
    !BEHAVIOR_VALUES.includes(
      candidate.behavior as (typeof BEHAVIOR_VALUES)[number],
    )
  ) {
    return fail(
      `Esperado: behavior deve ser um de: ${BEHAVIOR_VALUES.map((v) => `"${v}"`).join(" | ")}`,
      candidate.behavior,
    );
  }

  return true;
}

export function assertBehaviorProps(
  candidate: unknown,
): candidate is BehaviorProps {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: BehaviorProps\n  Formato: { readonly?: boolean; required?: boolean; hidden?: boolean }`,
      candidate,
    );
  }

  for (const key of BEHAVIOR_PROP_KEYS) {
    if (key in candidate && typeof candidate[key] !== "boolean") {
      return fail(`BehaviorProps: '${key}' deve ser boolean`, candidate[key]);
    }
  }

  return true;
}

export function assertBehaviorConfig(
  candidate: unknown,
): candidate is BehaviorConfig {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: BehaviorConfig\n  Variante A: { behavior: "${BEHAVIOR_VALUES.map((v) => `"${v}"`).join(" | ")}" }\n  Variante B: { readonly?: boolean; required?: boolean; hidden?: boolean }`,
      candidate,
    );
  }

  const hasBehavior = "behavior" in candidate;
  const presentProps = BEHAVIOR_PROP_KEYS.filter((k) => k in candidate);

  if (hasBehavior && presentProps.length > 0) {
    return fail(
      `BehaviorConfig: 'behavior' não pode ser combinado com '${presentProps.join("', '")}'\n` +
        `  Use 'behavior' sozinho para presets ou as propriedades individuais para controle granular`,
      candidate,
    );
  }

  if (hasBehavior) return assertBehavior(candidate);
  return assertBehaviorProps(candidate);
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function assertLayoutConfig(
  candidate: unknown,
): candidate is LayoutConfig {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: LayoutConfig\n  Formato: { breakLine?: boolean; size?: "${SIZE_VALUES.map((v) => `"${v}"`).join(" | ")}" }`,
      candidate,
    );
  }

  if ("breakLine" in candidate && typeof candidate.breakLine !== "boolean") {
    return fail(
      `LayoutConfig: 'breakLine' deve ser boolean`,
      candidate.breakLine,
    );
  }

  if (
    "size" in candidate &&
    !SIZE_VALUES.includes(candidate.size as (typeof SIZE_VALUES)[number])
  ) {
    return fail(
      `LayoutConfig: 'size' deve ser um de: ${SIZE_VALUES.map((v) => `"${v}"`).join(" | ")}`,
      candidate.size,
    );
  }

  return true;
}

// ─── Selection ────────────────────────────────────────────────────────────────

export function assertSelectOption(
  candidate: unknown,
): candidate is SelectOption {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: SelectOption\n  Formato: { value: string; identifier: string }`,
      candidate,
    );
  }

  if (typeof candidate.value !== "string") {
    return fail(`SelectOption: 'value' deve ser string`, candidate.value);
  }

  if (typeof candidate.identifier !== "string") {
    return fail(
      `SelectOption: 'identifier' deve ser string`,
      candidate.identifier,
    );
  }

  return true;
}

export function assertSelectOptions(
  candidate: unknown,
): candidate is SelectOptions {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: SelectOptions\n  Formato: { options?: SelectOption[] }`,
      candidate,
    );
  }

  if ("options" in candidate) {
    if (!Array.isArray(candidate.options)) {
      return fail(
        `SelectOptions: 'options' deve ser um array`,
        candidate.options,
      );
    }

    for (const [i, opt] of candidate.options.entries()) {
      try {
        assertSelectOption(opt);
      } catch (e) {
        throw new ValidationError(
          `SelectOptions.options[${i}]: ${(e as Error).message}`,
        );
      }
    }
  }

  return true;
}

export function assertSelectionConfig(
  candidate: unknown,
): candidate is SelectionConfig {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: SelectionConfig\n  Formato: { options?: SelectOption[]; query?: unknown }`,
      candidate,
    );
  }

  assertSelectOptions(candidate);
  // query é unknown — qualquer valor é válido

  return true;
}

// ─── MetadataProps ────────────────────────────────────────────────────────────

export function assertMetadataProps(
  candidate: unknown,
): candidate is MetadataProps {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: MetadataProps\n  Formato: Required<BehaviorProps & LayoutConfig & SelectionConfig>`,
      candidate,
    );
  }

  for (const key of BEHAVIOR_PROP_KEYS) {
    if (!(key in candidate)) {
      return fail(`MetadataProps: campo '${key}' é obrigatório`, candidate);
    }
    if (typeof candidate[key] !== "boolean") {
      return fail(`MetadataProps: '${key}' deve ser boolean`, candidate[key]);
    }
  }

  if (!("breakLine" in candidate)) {
    return fail(`MetadataProps: campo 'breakLine' é obrigatório`, candidate);
  }
  if (typeof candidate.breakLine !== "boolean") {
    return fail(
      `MetadataProps: 'breakLine' deve ser boolean`,
      candidate.breakLine,
    );
  }

  if (!("size" in candidate)) {
    return fail(`MetadataProps: campo 'size' é obrigatório`, candidate);
  }
  if (!SIZE_VALUES.includes(candidate.size as (typeof SIZE_VALUES)[number])) {
    return fail(
      `MetadataProps: 'size' deve ser um de: ${SIZE_VALUES.map((v) => `"${v}"`).join(" | ")}`,
      candidate.size,
    );
  }

  if (!("options" in candidate)) {
    return fail(`MetadataProps: campo 'options' é obrigatório`, candidate);
  }
  if (!Array.isArray(candidate.options)) {
    return fail(
      `MetadataProps: 'options' deve ser um array`,
      candidate.options,
    );
  }
  for (const [i, opt] of candidate.options.entries()) {
    try {
      assertSelectOption(opt);
    } catch (e) {
      throw new ValidationError(
        `MetadataProps.options[${i}]: ${(e as Error).message}`,
      );
    }
  }

  // query é obrigatório em Required<SelectionConfig>, mas é unknown — qualquer valor é válido
  if (!("query" in candidate)) {
    return fail(`MetadataProps: campo 'query' é obrigatório`, candidate);
  }

  return true;
}

// ─── MetadataConfig ───────────────────────────────────────────────────────────

export function assertMetadataConfig(
  candidate: unknown,
): candidate is MetadataConfig {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: MetadataConfig\n  Formato: BehaviorConfig & LayoutConfig & SelectionConfig`,
      candidate,
    );
  }

  assertBehaviorConfig(candidate);
  assertLayoutConfig(candidate);
  assertSelectionConfig(candidate);

  return true;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export function assertMetadata(candidate: unknown): candidate is Metadata {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: Metadata\n  Formato: { fields: Record<string, MetadataProps> }`,
      candidate,
    );
  }

  if (!("fields" in candidate) || !isPlainObject(candidate.fields)) {
    return fail(`Metadata: 'fields' deve ser um objeto`, candidate);
  }

  for (const [key, val] of Object.entries(candidate.fields)) {
    try {
      assertMetadataProps(val);
    } catch (e) {
      throw new ValidationError(
        `Metadata.fields['${key}']: ${(e as Error).message}`,
      );
    }
  }

  return true;
}

// ─── FieldId / FieldsIds ──────────────────────────────────────────────────────

export function assertFieldId(candidate: unknown): candidate is FieldId {
  if (!isPlainObject(candidate)) {
    return fail(`Esperado: FieldId\n  Formato: { _field?: string }`, candidate);
  }

  if ("_field" in candidate && typeof candidate._field !== "string") {
    return fail(`FieldId: '_field' deve ser string`, candidate._field);
  }

  return true;
}

export function assertFieldsIds(candidate: unknown): candidate is FieldsIds {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: FieldsIds\n  Formato: { _fields: string[] }`,
      candidate,
    );
  }

  if (!Array.isArray(candidate._fields)) {
    return fail(
      `FieldsIds: '_fields' deve ser um array de strings`,
      candidate._fields,
    );
  }

  for (const [i, f] of (candidate._fields as unknown[]).entries()) {
    if (typeof f !== "string") {
      throw new ValidationError(
        `FieldsIds._fields[${i}]: esperado string\n  Recebido: ${serialize(f)}`,
      );
    }
  }

  return true;
}

// ─── Value Conditions ─────────────────────────────────────────────────────────

export function assertValueConditionIs(
  candidate: unknown,
): candidate is ValueConditionIs {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionIs\n  Formato: { _field?: string; _is: Value }`,
      candidate,
    );
  }

  assertFieldId(candidate);

  if (!("_is" in candidate)) {
    return fail(`ValueConditionIs: campo '_is' é obrigatório`, candidate);
  }

  assertValue(candidate._is);
  return true;
}

export function assertValueConditionIsNot(
  candidate: unknown,
): candidate is ValueConditionIsNot {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionIsNot\n  Formato: { _field?: string; _isNot: Value }`,
      candidate,
    );
  }

  assertFieldId(candidate);

  if (!("_isNot" in candidate)) {
    return fail(`ValueConditionIsNot: campo '_isNot' é obrigatório`, candidate);
  }

  assertValue(candidate._isNot);
  return true;
}

export function assertValueConditionIsIn(
  candidate: unknown,
): candidate is ValueConditionIsIn {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionIsIn\n  Formato: { _field?: string; _isIn: Value[] }`,
      candidate,
    );
  }

  assertFieldId(candidate);

  if (!Array.isArray(candidate._isIn)) {
    return fail(
      `ValueConditionIsIn: '_isIn' deve ser um array`,
      candidate._isIn,
    );
  }

  for (const [i, v] of candidate._isIn.entries()) {
    try {
      assertValue(v);
    } catch (e) {
      throw new ValidationError(
        `ValueConditionIsIn._isIn[${i}]: ${(e as Error).message}`,
      );
    }
  }

  return true;
}

export function assertValueConditionIsNotIn(
  candidate: unknown,
): candidate is ValueConditionIsNotIn {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionIsNotIn\n  Formato: { _field?: string; _isNotIn: Value[] }`,
      candidate,
    );
  }

  assertFieldId(candidate);

  if (!Array.isArray(candidate._isNotIn)) {
    return fail(
      `ValueConditionIsNotIn: '_isNotIn' deve ser um array`,
      candidate._isNotIn,
    );
  }

  for (const [i, v] of candidate._isNotIn.entries()) {
    try {
      assertValue(v);
    } catch (e) {
      throw new ValidationError(
        `ValueConditionIsNotIn._isNotIn[${i}]: ${(e as Error).message}`,
      );
    }
  }

  return true;
}

export function assertValueConditionAre(
  candidate: unknown,
): candidate is ValueConditionAre {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionAre\n  Formato: { _fields: string[]; _are: Value[] }`,
      candidate,
    );
  }

  assertFieldsIds(candidate);

  if (!Array.isArray(candidate._are)) {
    return fail(`ValueConditionAre: '_are' deve ser um array`, candidate._are);
  }

  const fields = candidate._fields as string[];
  if (candidate._are.length !== fields.length) {
    return fail(
      `ValueConditionAre: '_are' deve ter o mesmo número de elementos que '_fields'\n` +
        `  _fields.length: ${fields.length}\n` +
        `  _are.length:    ${candidate._are.length}`,
      candidate._are,
    );
  }

  for (const [i, v] of candidate._are.entries()) {
    try {
      assertValue(v);
    } catch (e) {
      throw new ValidationError(
        `ValueConditionAre._are[${i}]: ${(e as Error).message}`,
      );
    }
  }

  return true;
}

export function assertValueConditionSomeIs(
  candidate: unknown,
): candidate is ValueConditionSomeIs {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionSomeIs\n  Formato: { _fields: string[]; _someIs: Value }`,
      candidate,
    );
  }

  assertFieldsIds(candidate);

  if (!("_someIs" in candidate)) {
    return fail(
      `ValueConditionSomeIs: campo '_someIs' é obrigatório`,
      candidate,
    );
  }

  assertValue(candidate._someIs);
  return true;
}

export function assertValueConditionIf(
  candidate: unknown,
): candidate is ValueConditionIf {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ValueConditionIf\n  Formato: { _if: (obj: InstanceObject) => boolean }`,
      candidate,
    );
  }

  if (typeof candidate._if !== "function") {
    return fail(
      `ValueConditionIf: '_if' deve ser uma função\n  Assinatura: (obj: InstanceObject) => boolean`,
      candidate._if,
    );
  }

  return true;
}

const assertByValueConditionKey: Record<
  ValueConditionKey,
  (c: unknown) => c is UnitValueCondition
> = {
  _is: assertValueConditionIs as (c: unknown) => c is UnitValueCondition,
  _isNot: assertValueConditionIsNot as (c: unknown) => c is UnitValueCondition,
  _isIn: assertValueConditionIsIn as (c: unknown) => c is UnitValueCondition,
  _isNotIn: assertValueConditionIsNotIn as (
    c: unknown,
  ) => c is UnitValueCondition,
  _are: assertValueConditionAre as (c: unknown) => c is UnitValueCondition,
  _someIs: assertValueConditionSomeIs as (
    c: unknown,
  ) => c is UnitValueCondition,
  _if: assertValueConditionIf as (c: unknown) => c is UnitValueCondition,
};

export function assertUnitValueCondition(
  candidate: unknown,
): candidate is UnitValueCondition {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: UnitValueCondition — objeto com exatamente uma das chaves:\n  ${VALUE_CONDITION_KEYS.join(", ")}`,
      candidate,
    );
  }

  const present = VALUE_CONDITION_KEYS.filter((k) => k in candidate);

  if (present.length === 0) {
    return fail(
      `UnitValueCondition: nenhuma chave de condição encontrada\n` +
        `  Esperado uma de: ${VALUE_CONDITION_KEYS.join(", ")}`,
      candidate,
    );
  }

  if (present.length > 1) {
    return fail(
      `UnitValueCondition: apenas uma chave de condição por vez\n` +
        `  Encontradas: ${present.join(", ")}`,
      candidate,
    );
  }

  const valueConditionKey = present[0] as ValueConditionKey;
  const assertConditionValue = assertByValueConditionKey[valueConditionKey];
  return assertConditionValue(candidate);
}

// ─── Changed Condition ────────────────────────────────────────────────────────

export function assertUnitChangedCondition(
  candidate: unknown,
): candidate is UnitChangedCondition {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: UnitChangedCondition — objeto com uma das chaves:\n  ${CHANGED_CONDITION_KEYS.join(", ")}`,
      candidate,
    );
  }

  const present = CHANGED_CONDITION_KEYS.filter((k) => k in candidate);

  if (present.length === 0) {
    return fail(
      `UnitChangedCondition: nenhuma chave de condição encontrada\n` +
        `  Esperado uma de: ${CHANGED_CONDITION_KEYS.join(", ")}`,
      candidate,
    );
  }

  if (present.length > 1) {
    return fail(
      `UnitChangedCondition: apenas uma chave de condição por vez\n` +
        `  Encontradas: ${present.join(", ")}`,
      candidate,
    );
  }

  const key = present[0] as ChangedConditionKey;

  if (key === "_fieldChanged" && typeof candidate._fieldChanged !== "string") {
    return fail(
      `UnitChangedCondition: '_fieldChanged' deve ser string`,
      candidate._fieldChanged,
    );
  }

  if (key === "_someFieldChanged") {
    if (!Array.isArray(candidate._someFieldChanged)) {
      return fail(
        `UnitChangedCondition: '_someFieldChanged' deve ser um array de strings`,
        candidate._someFieldChanged,
      );
    }
    for (const [i, f] of (candidate._someFieldChanged as unknown[]).entries()) {
      if (typeof f !== "string") {
        throw new ValidationError(
          `UnitChangedCondition._someFieldChanged[${i}]: esperado string\n  Recebido: ${serialize(f)}`,
        );
      }
    }
  }

  if (key === "_if" && typeof candidate._if !== "function") {
    return fail(
      `UnitChangedCondition: '_if' deve ser uma função\n  Assinatura: (oldObj: InstanceObject, newObj: InstanceObject) => boolean`,
      candidate._if,
    );
  }

  return true;
}

// ─── Draft Condition ──────────────────────────────────────────────────────────

export function assertUnitDraftCondition(
  candidate: unknown,
): candidate is UnitDraftCondition {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: UnitDraftCondition (UnitValueCondition | UnitChangedCondition)`,
      candidate,
    );
  }

  const exclusiveValueKeys = VALUE_CONDITION_KEYS.filter(
    (k) => k !== "_if" && k in candidate,
  );
  const exclusiveChangedKeys = CHANGED_CONDITION_KEYS.filter(
    (k) => k !== "_if" && k in candidate,
  );
  const hasIf = "_if" in candidate;
   
  if (exclusiveValueKeys.length > 0 && exclusiveChangedKeys.length > 0) {
    return fail(
      `UnitDraftCondition: não é possível combinar condições de valor com condições de alteração\n` +
        `  Condições de valor encontradas:     ${exclusiveValueKeys.join(", ")}\n` +
        `  Condições de alteração encontradas: ${exclusiveChangedKeys.join(", ")}`,
      candidate,
    );
  }

  if (!exclusiveValueKeys.length && !exclusiveChangedKeys.length && !hasIf) {
    return fail(
      `UnitDraftCondition: nenhuma chave de condição encontrada\n` +
        `  Condições de valor:     ${VALUE_CONDITION_KEYS.join(", ")}\n` +
        `  Condições de alteração: ${CHANGED_CONDITION_KEYS.join(", ")}`,
      candidate,
    );
  }

  if (exclusiveChangedKeys.length > 0)
    return assertUnitChangedCondition(candidate);
  return assertUnitValueCondition(candidate);
}

// ─── Draft Config & Transform ─────────────────────────────────────────────────

export function assertDraftConfig(
  candidate: unknown,
): candidate is DraftConfig {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: DraftConfig\n  Formato: { setValue: Value }`,
      candidate,
    );
  }

  if (!("setValue" in candidate)) {
    return fail(`DraftConfig: campo 'setValue' é obrigatório`, candidate);
  }

  assertValue(candidate.setValue);
  return true;
}

export function assertConditionalValueSet(
  candidate: unknown,
): candidate is ConditionalValueSet {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ConditionalValueSet\n  Formato: UnitDraftCondition & { setValue: Value }`,
      candidate,
    );
  }

  assertUnitDraftCondition(candidate);
  assertDraftConfig(candidate);
  return true;
}

export function assertFieldDraftTransform(
  candidate: unknown,
): candidate is FieldDraftTransform {
  if (Array.isArray(candidate)) {
    for (const [i, item] of candidate.entries()) {
      try {
        assertConditionalValueSet(item);
      } catch (e) {
        throw new ValidationError(
          `FieldDraftTransform[${i}]: ${(e as Error).message}`,
        );
      }
    }
    return true;
  }

  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: FieldDraftTransform\n` +
        `  { setValue }                  → valor fixo\n` +
        `  { <condição>, setValue }       → valor condicional\n` +
        `  [{ <condição>, setValue }, …]  → lista de condicionais`,
      candidate,
    );
  }

  const allConditionKeys = [
    ...VALUE_CONDITION_KEYS,
    ...CHANGED_CONDITION_KEYS,
  ] as const;
  const hasCondition = allConditionKeys.some((k) => k in candidate);
  const hasSetValue = "setValue" in candidate;

  if (!hasCondition && !hasSetValue) {
    return fail(
      `FieldDraftTransform: deve conter 'setValue' (valor fixo) ou uma chave de condição + 'setValue'`,
      candidate,
    );
  }

  if (hasCondition && !hasSetValue) {
    return fail(
      `FieldDraftTransform: 'setValue' é obrigatório quando uma condição está presente`,
      candidate,
    );
  }

  if (hasCondition) return assertConditionalValueSet(candidate);
  return assertDraftConfig(candidate);
}

export function assertDraftTransform(
  candidate: unknown,
): candidate is DraftTransform {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: DraftTransform\n  Formato: Record<string, FieldDraftTransform>`,
      candidate,
    );
  }

  for (const [key, val] of Object.entries(candidate)) {
    try {
      assertFieldDraftTransform(val);
    } catch (e) {
      throw new ValidationError(
        `DraftTransform['${key}']: ${(e as Error).message}`,
      );
    }
  }

  return true;
}

// ─── Metadata Transform ───────────────────────────────────────────────────────

export function assertConditionalMetadata(
  candidate: unknown,
): candidate is ConditionalMetadata {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: ConditionalMetadata\n  Formato: UnitValueCondition & MetadataConfig`,
      candidate,
    );
  }

  assertUnitValueCondition(candidate);
  assertMetadataConfig(candidate);
  return true;
}

export function assertFieldMetadataTransform(
  candidate: unknown,
): candidate is FieldMetadataTransform {
  if (Array.isArray(candidate)) {
    for (const [i, item] of candidate.entries()) {
      try {
        assertConditionalMetadata(item);
      } catch (e) {
        throw new ValidationError(
          `FieldMetadataTransform[${i}] com valor: "${JSON.stringify(item, null, 2)}": \n${(e as Error).message}`,
        );
      }
    }
    return true;
  }

  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: FieldMetadataTransform\n` +
        `  MetadataConfig         → configuração direta\n` +
        `  ConditionalMetadata    → { <condição>, ...MetadataConfig }\n` +
        `  ConditionalMetadata[]  → lista de condicionais`,
      candidate,
    );
  }

  const hasCondition = VALUE_CONDITION_KEYS.some((k) => k in candidate);
  if (hasCondition) return assertConditionalMetadata(candidate);
  return assertMetadataConfig(candidate);
}

export function assertMetadataTransform(
  candidate: unknown,
): candidate is MetadataTransform {
  if (!isPlainObject(candidate)) {
    return fail(
      `Esperado: MetadataTransform\n  Formato: Record<string, FieldMetadataTransform>`,
      candidate,
    );
  }

  for (const [key, value] of Object.entries(candidate)) {
    try {
      assertFieldMetadataTransform(value);
    } catch (e) {
      throw new ValidationError(
        `MetadataTransform['${key}'] com valor "${JSON.stringify(value, null, 2)}". ${(e as Error).message}`,
      );
    }
  }

  return true;
}
