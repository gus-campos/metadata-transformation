import { Apply, MetadataProps } from "../pure/metadata-transform";
import {
  BehaviorProp,
  SlimMetadataProps,
  toMetadataProps,
} from "./slim-metadata-props";

const KEY_VALUE_FROM_STRING = {
  omitted: { behavior: "omitted" },
  displayed: { behavior: "displayed" },
  mandatory: { behavior: "mandatory" },
  editable: { behavior: "editable" },
  readOnly: { readOnly: true },
  required: { required: true },
  hidden: { hidden: true },
  breakLine: { breakLine: true },
} as const satisfies Record<string, MetadataProps & BehaviorProp>;

type MetadataPropTerm = keyof typeof KEY_VALUE_FROM_STRING;

export type ApplyTermProps = {
  _apply?: MetadataPropTerm | MetadataPropTerm[];
};

export type SlimApplyObject = Apply & {
  _apply?: SlimMetadataProps;
};

// Apply que compreende as props encurtadas, e os termos de props
export type SlimApply = ApplyTermProps | SlimApplyObject;

export function toApply(slimApply: SlimApply): Apply {
  // Apenas props nativas em formatos nativos

  const applyObj = toShotcuttedApplyObject(slimApply);
  if (!applyObj._apply) return {};
  return { _apply: toMetadataProps(applyObj._apply) };
}

function toShotcuttedApplyObject(
  slimApply: SlimApply,
): SlimApplyObject {
  const apply = slimApply._apply;

  if (!apply) return {};

  if (typeof apply !== "string" && !Array.isArray(apply))
    return { _apply: { ...apply } };

  const termsArray: MetadataPropTerm[] = Array.isArray(apply) ? apply : [apply];

  const propsTranslatedFromEntries = termsArray.reduce((acc, current) => {
    const props = KEY_VALUE_FROM_STRING[current];
    return { ...acc, ...props };
  }, {} as MetadataProps);

  return { _apply: { ...propsTranslatedFromEntries } };
}
