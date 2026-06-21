import { toArray } from "../../utils/toArray";
import { Match } from "../pure/instance-condition";
import {
    FieldMetadataTransform,
    FieldsMetadataTransform,
} from "../pure/metadata-transform";
import { toApply, SlimApply } from "./slim-apply";
import { SlimMatch, toMatch } from "./slim-match";

type Conditions = {
    [conditionName: string]: SlimMatch;
};

type SlimFieldMetadataTransform = FieldMetadataTransform & {
    _condition?: string | string[];
    _match?: SlimMatch;
    _apply?: SlimApply;
};

export type SlimFieldsMetadataTransform = {
    _conditions?: Conditions;

    [fieldIdentifier: string]:
        | SlimFieldMetadataTransform
        | SlimFieldMetadataTransform[]
        // Na prática, não deve ser aceito
        | Conditions
        | undefined;
};

// ======================== Converters ========================

export function toFieldsMetadataTransform(
    transform: SlimFieldsMetadataTransform,
): FieldsMetadataTransform {
    const { _conditions: conditions, ...rest } = transform;

    const pureFieldsTransform = rest as
        | SlimFieldMetadataTransform
        | SlimFieldMetadataTransform[];

    const simpleTransform = {} as Record<string, unknown>;

    for (const [fieldIdentifier, fieldTransform] of Object.entries(
        pureFieldsTransform,
    )) {
        simpleTransform[fieldIdentifier] = toArray(fieldTransform).map(
            (transform) =>
                toFieldMetadataTransform(
                    transform,
                    fieldIdentifier,
                    // conditions ?? null,
                ),
        );
    }

    return simpleTransform as FieldsMetadataTransform;
}

function toFieldMetadataTransform(
    fieldTransform: SlimFieldMetadataTransform,
    fieldIdentifier: string,
): FieldMetadataTransform {
    const apply = fieldTransform._apply ? toApply(fieldTransform._apply) : null;

    const match = fieldTransform._match
        ? toMatch(fieldTransform._match, fieldIdentifier)
        : null;

    const { _condition, ...cleanTransform } = fieldTransform;

    return {
        ...cleanTransform,
        ...(apply && { _apply: apply }),
        ...(match && { _match: match }),
    };
}