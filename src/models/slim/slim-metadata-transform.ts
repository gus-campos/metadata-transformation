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
                    conditions ?? null,
                ),
        );
    }

    return simpleTransform as FieldsMetadataTransform;
}

function toFieldMetadataTransform(
    fieldTransform: SlimFieldMetadataTransform,
    fieldIdentifier: string,
    conditions: Conditions | null,
): FieldMetadataTransform {
    const fieldConditionsMatches = getFieldConditionsMatches(
        fieldTransform,
        conditions,
    );

    const apply = fieldTransform._apply ? toApply(fieldTransform._apply) : null;

    const match = fieldTransform._match
        ? toMatch(fieldTransform._match, fieldIdentifier)
        : null;

    const { _condition, ...cleanTransform } = fieldTransform;

    return {
        ...cleanTransform,
        ...(apply && { _apply: apply }),
        ...(match && { _match: match }),
        ...(fieldConditionsMatches && {
            __conditionsMatches: fieldConditionsMatches,
        }),
    };
}

function getFieldConditionsMatches(
    fieldTransform: SlimFieldMetadataTransform,
    conditions: Conditions | null,
): Match[] | null {
    const conditionsNames = toArray(fieldTransform._condition ?? []);
    if (conditionsNames.length === 0) return null;

    if (!conditions)
        throw new Error("Não foi definida nenhuma condição");

    const namesNotDefined = !conditions
        ? conditionsNames
        : conditionsNames.filter((name) => !(name in conditions));

    if (namesNotDefined.length > 0) {
        throw new Error(
            `As seguintes condições não foram definidas: ${namesNotDefined.join(", ")}`,
        );
    }

    return conditionsNames.map((conditionName) => {
        const slimMatch = conditions![conditionName]!;
        return toMatch(slimMatch);
    });
}
