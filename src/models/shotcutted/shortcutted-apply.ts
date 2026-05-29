import { Apply, MetadataProps } from "../pure/metadata-transform";
import {
  BehaviorProp,
  ShortcuttedMetadataProps,
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

type PropTermsApply = {
  _apply?: MetadataPropTerm | MetadataPropTerm[];
};

// Apply que compreende as props encurtadas, e os termos de props
export type ShortcuttedApply =
  | PropTermsApply
  | (Apply & {
      _apply?: ShortcuttedMetadataProps;
    });

// TODO: Mapear esses tipos num diagrama de classes ou parecido
export function toApply(shorthandApply: ShortcuttedApply): Apply {
  const _apply = shorthandApply._apply;

  if (typeof _apply !== "string" && !Array.isArray(_apply))
    return { ..._apply } as Apply;

  const termsArray: MetadataPropTerm[] = Array.isArray(_apply)
    ? _apply
    : [_apply];

  const propsTranslatedFromEntries = termsArray.reduce((acc, current) => {
    const props = KEY_VALUE_FROM_STRING[current];
    return { ...acc, ...props };
  }, {} as Partial<Apply>);

  return { ...propsTranslatedFromEntries };
}
