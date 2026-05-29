import { isPlainObject } from "../../utils/is-plain-object";
import { InstanceIdSet } from "../pure/common";
import { MetadataProps, NameProp, Option } from "../pure/metadata-transform";

const BEHAVIOR_PROPS = {
  omitted: { hidden: true, required: false, readOnly: false },
  mandatory: { hidden: false, required: true, readOnly: false },
  editable: { hidden: false, required: false, readOnly: false },
  displayed: { hidden: false, required: false, readOnly: true },
} as const satisfies Record<string, Partial<MetadataProps>>;

type BehaviorKey = keyof typeof BEHAVIOR_PROPS;

export type BehaviorProp = {
  behavior?: BehaviorKey;
};

// =============================================================================

type MultiplicityRange = [number | null, number | null];

type ShortcuttedMultiplicityProp = {
  multiplicity?: number | MultiplicityRange;
};

// =============================================================================

type ShortcuttedMask = {
  mask?: string | MetadataProps["mask"];
};

// =============================================================================

type ShortcuttedNameProp = string | NameProp;

type ShortcuttedNamesProps = {
  name?: ShortcuttedNameProp;
  editHelp?: ShortcuttedNameProp;
  placeholder?: ShortcuttedNameProp;
};

const SIMPLY_NAMED_PROPS_KEYS = [
  "name",
  "editHelp",
  "placeholder",
] as const satisfies (keyof ShortcuttedNamesProps)[];

// =============================================================================

type ShortcuttedValueOptionsProp = {
  valueOptions?: (string | Option)[];
};

// =============================================================================

export type ShortcuttedMetadataProps = MetadataProps &
  BehaviorProp &
  ShortcuttedMultiplicityProp &
  ShortcuttedValueOptionsProp &
  ShortcuttedNamesProps &
  ShortcuttedMask;

export function toMetadataProps(
  shortcuttedProps: ShortcuttedMetadataProps,
): MetadataProps {
  let metadataProps = { ...shortcuttedProps };

  if ("behavior" in metadataProps) {
    const { behavior, ...rest } = metadataProps;
    metadataProps = { ...rest, ...BEHAVIOR_PROPS[behavior!] };
  }

  // TODO: Decidir se vai rejeitar array de 1 ou 3... posições
  if ("multiplicity" in metadataProps) {
    const { multiplicity, ...rest } = metadataProps;

    metadataProps = {
      ...rest,
      ...toMinMaxMultiplicityProps(multiplicity!),
    };
  }

  // Substituindo passagem de id (string simples) por um objeto com id
  if ("mask" in metadataProps) {
    const { mask, ...rest } = metadataProps;
    if (typeof mask !== "string") return { ...rest, mask: mask! };
    return { ...rest, mask: toIdSet(mask!) };
  }

  // Substitundo passagem de string por objeto de nome com "pt" e "_current"
  for (const key of SIMPLY_NAMED_PROPS_KEYS) {
    if (key in metadataProps)
      metadataProps = {
        ...metadataProps,
        [key]: toNameProp(metadataProps[key] as ShortcuttedNameProp),
      };
  }

  // Substituindo value options de strings por options
  if ("valueOptions" in metadataProps) {
    const { valueOptions, ...rest } = metadataProps;
    metadataProps = { ...rest, valueOptions: toOptionsProps(valueOptions!) };
  }

  return metadataProps;
}

function toIdSet(id: string, classId?: string): InstanceIdSet {
  return { _id: id, _classId: classId };
}

function toNameProp(expandedNameProp: ShortcuttedNameProp): NameProp {
  if (isPlainObject(expandedNameProp)) return expandedNameProp;
  return { pt: expandedNameProp, _current: expandedNameProp };
}

function toMinMaxMultiplicityProps(
  multiplicity: ShortcuttedMultiplicityProp["multiplicity"],
) {
  if (!multiplicity) return {};

  let min: number | null;
  let max: number | null;

  if (Array.isArray(multiplicity)) {
    [min, max] = multiplicity;
  } else {
    min = multiplicity;
    max = multiplicity;
  }

  return {
    ...(min != null && { minMultiplicity: min }),
    ...(max != null && { maxMultiplicity: max }),
  } as MetadataProps;
}

function toOptionsProps(extendedOptions: (string | Option)[]): Option[] {
  return extendedOptions.map((option) => {
    if (typeof option === "string")
      return { identifier: option, value: option };
    return option;
  });
}
