import { Behavior, BehaviorConfig, BehaviorProps, LayoutConfig, MetadataConfig, MetadataProps, SelectionConfig, SelectOption, SelectOptions } from "../models/metadata-config";
import { BEHAVIOR_PROP_KEYS, BEHAVIOR_VALUES, SIZE_VALUES } from "./constants";
import { fail, isPlainObject, ValidationError } from "./utils";

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