import { Apply, MetadataProps } from "../pure/metadata-transform";
import { BehaviorProp, ExpandedMetadataProps } from "./expanded-metadata-props";

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
  Partial<MetadataProps & BehaviorProp>
>;

type MetadataTerm = keyof typeof KEY_VALUE_FROM_STRING;

type ApplyTerms = {
  _apply?: MetadataTerm | MetadataTerm[];
};

type ApplyShorthand = ApplyTerms | Apply;

export type ExpandedApplyObject = Apply & {
    _apply?: ExpandedMetadataProps
}

// TODO: Mapear esses tipos num diagrama de classes ou parecido
export function toExpandedApplyObject(shorthandApply: ApplyShorthand): ExpandedApplyObject {
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
