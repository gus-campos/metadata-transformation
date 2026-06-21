import { Metadata } from "../models/pure/common";
import {
    MetadataProps,
    NAME_PROP_KEYS,
    NameProp,
    Option,
} from "../models/pure/metadata-transform";
import { getTypedEntries } from "../utils/get-typed-entries";

export function applyMetadata(
    metadata: Metadata,
    fieldIdentifier: string,
    metadataApply: MetadataProps,
) {
    // TODO: Passar isso pro validador?
    if (!(fieldIdentifier in metadata.fields)) {
        throw new Error(
            `O identificador ${fieldIdentifier} não existe no metadata. ` +
                `Os campos do metadata são ${Object.keys(metadata.fields).join(", ")}`,
        );
    }

    const fieldMetadata = metadata.fields[fieldIdentifier]!;

    const entries = getTypedEntries(metadataApply);
    for (const [propKey, value] of entries) {
        const field = fieldMetadata as any;

        if (propKey === "valueOptions") {
            const current = fieldMetadata.valueOptions;
            const incoming = value as Option[];
            current.splice(0, current.length, ...incoming);
        } else if ((NAME_PROP_KEYS as string[]).includes(propKey)) {
            // Setar somente as subpropriedades, sem apagar as outras
            const nameProp = value as NameProp;
            for (const [namePropKey, nameGiven] of Object.entries(nameProp)) {
                field[propKey][namePropKey] = nameGiven;
            }
        } else {
            field[propKey] = value;
        }
    }
}
