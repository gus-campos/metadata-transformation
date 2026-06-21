import { Metadata } from "../models/pure/common";
import { MetadataProps, Option } from "../models/pure/metadata-transform";
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
        } else {
            field[propKey] = value;
        }
    }
}
