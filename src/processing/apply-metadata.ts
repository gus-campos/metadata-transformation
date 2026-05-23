import { Metadata, MetadataProps } from "../models/common";
import { MetadataApply } from "../models/metadata-transform";
import { getTypedEntries } from "../utils/get-typed-entries";

// TODO: Verificar se readOnly pode ter efeitos colaterais
const BEHAVIOR_DEFINITION = {
  omitted: { hidden: true, required: false, readOnly: false },
  mandatory: { hidden: false, required: true, readOnly: false },
  editable: { hidden: false, required: false, readOnly: false },
  displayed: { hidden: false, required: false, readOnly: true },
};

export function applyMetadata(
  metadata: Metadata,
  fieldIdentifier: string,
  metadataApply: MetadataApply,
) {
  if (!(fieldIdentifier in metadata.fields)) {
    throw new Error(
      `O identificador ${fieldIdentifier} não existe no metadata. ` +
        `Os campos do metadata são ${Object.keys(metadata.fields).join(", ")}`,
    );
  }

  const fieldMetadata = metadata.fields[fieldIdentifier]!;

  // FIXME: Verificar em runtime se os tipos batem!?

  const { behavior } = metadataApply;

  if (behavior) {
    const behaviorPropsToApply = BEHAVIOR_DEFINITION[behavior];
    for (const [prop, value] of getTypedEntries(behaviorPropsToApply))
      (fieldMetadata as any)[prop] = value;
  }

  const entries = getTypedEntries(metadataApply);
  for (const [propKey, value] of entries) {
    const field = fieldMetadata as any;

    if (propKey === "valueOptions") {
      const current = fieldMetadata.valueOptions;
      const incoming = value as MetadataProps["valueOptions"];
      current.splice(0, current.length, ...incoming);
      
    } else if (propKey !== "behavior") {
      field[propKey] = value;
    }
  }
}
