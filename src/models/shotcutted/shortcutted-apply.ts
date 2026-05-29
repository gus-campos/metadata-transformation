import { Apply, MetadataProps } from "../pure/metadata-transform";
import {
  BehaviorProp,
  ShortcuttedMetadataProps,
  toMetadataProps,
} from "./shortcutted-metadata-props";

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

type ApplyTermProps = {
  _apply?: MetadataPropTerm | MetadataPropTerm[];
};

type ShortcuttedApplyObject = Apply & {
  _apply?: ShortcuttedMetadataProps;
};

// Apply que compreende as props encurtadas, e os termos de props
export type ShortcuttedApply = ApplyTermProps | ShortcuttedApplyObject;

export function toApply(shortcuttedApply: ShortcuttedApply): Apply {
  // Apenas props nativas em formatos nativos

  const applyObj = toShotcuttedApplyObject(shortcuttedApply);
  if (!applyObj._apply) return {};
  return { _apply: toMetadataProps(applyObj._apply) };
}

function toShotcuttedApplyObject(
  shortcuttedApply: ShortcuttedApply,
): ShortcuttedApplyObject {
  const apply = shortcuttedApply._apply;

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
