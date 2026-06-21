import { Apply, MetadataProps } from "../pure/metadata-transform";
import {
    BehaviorProp,
    SlimMetadataProps,
    toMetadataProps,
} from "./slim-metadata-props";

const SLIM_KEY_VALUE_FROM_TERM_STRING = {
    omitted: { behavior: "omitted" },
    displayed: { behavior: "displayed" },
    mandatory: { behavior: "mandatory" },
    editable: { behavior: "editable" },
    readOnly: { readOnly: true },
    required: { required: true },
    hidden: { hidden: true },
    breakLine: { breakLine: true },
} as const satisfies Record<string, MetadataProps & BehaviorProp>;

// =================================================================================================

type MetadataPropTerm = keyof typeof SLIM_KEY_VALUE_FROM_TERM_STRING;

// Termos (strings) que resumem props
export type TermProps = MetadataPropTerm | MetadataPropTerm[];

// Objeto com props e props encurtadas
export type SlimApplyObject = Omit<Apply, "valueOptions"> & SlimMetadataProps;

// Tipo que compreende as props encurtadas, e os termos de props (strings)
export type SlimApply = TermProps | SlimApplyObject;

// =================================================================================================

export function toApply(slimApply: SlimApply): Apply {
    // Apenas props nativas em formatos nativos
    const applyObj = toSlimApplyObject(slimApply);
    return toMetadataProps(applyObj);
}

function toSlimApplyObject(slimApply: SlimApply): SlimApplyObject {
    if (!slimApply) return {};

    if (typeof slimApply !== "string" && !Array.isArray(slimApply))
        return { ...slimApply };

    const termsArray: MetadataPropTerm[] = Array.isArray(slimApply)
        ? slimApply
        : [slimApply];

    const propsTranslatedFromEntries = termsArray.reduce((acc, current) => {
        const props = SLIM_KEY_VALUE_FROM_TERM_STRING[current];
        return { ...acc, ...props };
    }, {} as MetadataProps);

    return { ...propsTranslatedFromEntries };
}
