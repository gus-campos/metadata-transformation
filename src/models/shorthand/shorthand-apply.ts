import { Apply, MetadataProps } from "../pure/metadata-transform";

// =================================================================================================

const BEHAVIOR_PROPS = {
  omitted: { hidden: true, required: false, readOnly: false },
  mandatory: { hidden: false, required: true, readOnly: false },
  editable: { hidden: false, required: false, readOnly: false },
  displayed: { hidden: false, required: false, readOnly: true },
} as const;

type BehaviorKey = keyof typeof BEHAVIOR_PROPS;

type ApplyBehavior = {
  _apply: {
    behavior?: BehaviorKey;
  };
};

// =================================================================================================

type MultiplicityRange = [number | null, number | null];

type MultiplicityApply = {
  _apply: {
    multiplicity?: MultiplicityRange;
  };
};

type ExpandedApplyObject = Apply["_apply"] &
  ApplyBehavior["_apply"] &
  MultiplicityApply["_apply"];

// =================================================================================================

const KEY_VALUE_FROM_STRING = {
  omitted: { behavior: "omitted" },
  displayed: { behavior: "displayed" },
  mandatory: { behavior: "mandatory" },
  editable: { behavior: "editable" },
  readOnly: { readOnly: true },
  required: { required: true },
  hidden: { hidden: true },
  breakLine: { breakLine: true },
} as const satisfies Record<
  string,
  Partial<Apply["_apply"] & ApplyBehavior["_apply"]>
>;

type MetadataTerm = keyof typeof KEY_VALUE_FROM_STRING;

type ApplyTerm = {
  _apply?: MetadataTerm | MetadataTerm[];
};

type ApplyShorthand = ApplyTerm | (Apply & ApplyBehavior & MultiplicityApply);

// =================================================================================================

export function toPureApply(shorthandApply: ApplyShorthand): Apply {
  let applyObject = toApplyObject(shorthandApply);

  if ("behavior" in applyObject) {
    const { behavior, ...rest } = applyObject;
    applyObject = { ...rest, ...BEHAVIOR_PROPS[behavior!] };
  }

  if ("multiplicity" in applyObject) {
    const { multiplicity, ...rest } = applyObject;
    const [min, max] = multiplicity!;

    applyObject = {
      ...rest,
      ...(min != null && { minMultiplicity: min }),
      ...(max != null && { maxMultiplicity: max }),
    };
  }

  return applyObject as Apply;
}

function toApplyObject(shorthandApply: ApplyShorthand): ExpandedApplyObject {
  const _apply = shorthandApply._apply;

  if (typeof _apply !== "string" && !Array.isArray(_apply))
    return { ..._apply } as ExpandedApplyObject;

  const termsArray = Array.isArray(_apply) ? _apply : [_apply];

  // Acumular entradas traduzidas a partir das strings
  const translatedEntries = termsArray.reduce(
    (acc, current) => ({ ...acc, ...KEY_VALUE_FROM_STRING[current] }),
    {} as Partial<ExpandedApplyObject>,
  );

  return { ...translatedEntries };
}
