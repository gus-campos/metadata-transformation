import { isPlainObject } from "../../utils/is-plain-object";
import { MetadataProps, NameProp, Option } from "../pure/metadata-transform";

const BEHAVIOR_PROPS = {
  omitted: { hidden: true, required: false, readOnly: false },
  mandatory: { hidden: false, required: true, readOnly: false },
  editable: { hidden: false, required: false, readOnly: false },
  displayed: { hidden: false, required: false, readOnly: true },
} as const;

type BehaviorKey = keyof typeof BEHAVIOR_PROPS;

export type BehaviorProp = {
  behavior?: BehaviorKey;
};

// =============================================================================

type MultiplicityRange = [number | null, number | null];

type MultiplicityRangeProp = {
  multiplicity?: MultiplicityRange;
};

// =============================================================================

type ExpandedNameProp = string | NameProp;

type SimplyNamedProps = {
  name?: ExpandedNameProp;
  editHelp?: ExpandedNameProp;
  placeholder?: ExpandedNameProp;
};

const SIMPLY_NAMED_PROPS_KEYS = [
  "name",
  "editHelp",
  "placeholder",
] as const satisfies (keyof ExpandedMetadataProps)[];

// =============================================================================

type ExpandedOptionsProps = {
  valueOptions?: (string | Option)[];
};

// =============================================================================

export type ExpandedMetadataProps = MetadataProps &
  BehaviorProp &
  MultiplicityRangeProp &
  ExpandedOptionsProps &
  SimplyNamedProps;

export function toMetadataProps(
  expandedProps: ExpandedMetadataProps,
): MetadataProps {
  let metadataProps = { ...expandedProps };

  if ("behavior" in metadataProps) {
    const { behavior, ...rest } = metadataProps;
    metadataProps = { ...rest, ...BEHAVIOR_PROPS[behavior!] };
  }

  if ("multiplicity" in metadataProps) {
    const { multiplicity, ...rest } = metadataProps;
    const [min, max] = multiplicity!;

    metadataProps = {
      ...rest,
      ...(min != null && { minMultiplicity: min }),
      ...(max != null && { maxMultiplicity: max }),
    };
  }

  // Substituindo passagem de id (string simples) por um objeto com id
  for (const key of SIMPLY_NAMED_PROPS_KEYS) {
    if (key in metadataProps)
      metadataProps = {
        ...metadataProps,
        [key]: toNameProp(metadataProps[key] as ExpandedNameProp),
      };
  }

  // Substituindo value options de strings por options
  if ("valueOptions" in metadataProps) {
    const { valueOptions, ...rest } = metadataProps;
    metadataProps = { ...rest, ...toOptionsProps(valueOptions!) };
  }

  return metadataProps;
}

function toNameProp(expandedNameProp: ExpandedNameProp): NameProp {
  if (isPlainObject(expandedNameProp)) return expandedNameProp;
  return { pt: expandedNameProp, _current: expandedNameProp };
}

function toOptionsProps(extendedOptions: (string | Option)[]): Option[] {
  return extendedOptions.map((option) => {
    if (typeof option === "string")
      return { identifier: option, value: option };
    return option;
  });
}
