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

export type ShortcuttedMetadataProps = Omit<MetadataProps, "valueOptions"> &
  BehaviorProp &
  ShortcuttedMultiplicityProp &
  ShortcuttedValueOptionsProp &
  ShortcuttedNamesProps &
  ShortcuttedMask;

export function toMetadataProps({
  behavior,
  multiplicity,
  mask,
  name,
  editHelp,
  placeholder,
  valueOptions,
  ...rest
}: ShortcuttedMetadataProps): MetadataProps {
  const behaviorProps = behavior ? BEHAVIOR_PROPS[behavior] : null;

  const multiplicityProps = toMinMaxMultiplicityProps(multiplicity);

  const maskProp =
    mask !== undefined
      ? { mask: typeof mask === "string" ? toIdSet(mask) : mask }
      : null;

  const nameProp = name !== undefined ? { name: toNameProp(name) } : null;
  const editHelpProp =
    editHelp !== undefined ? { editHelp: toNameProp(editHelp) } : null;
  const placeholderProp =
    placeholder !== undefined ? { placeholder: toNameProp(placeholder) } : null;

  const valueOptionsProp =
    valueOptions !== undefined
      ? { valueOptions: toOptionsProps(valueOptions) }
      : null;

  return {
    ...rest,
    ...behaviorProps,
    ...multiplicityProps,
    ...maskProp,
    ...nameProp,
    ...editHelpProp,
    ...placeholderProp,
    ...valueOptionsProp,
  };
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
      return {
        identifier: option,
        value: option.toLowerCase().replace(/\s+/g, "_"),
      };
    return option;
  });
}
