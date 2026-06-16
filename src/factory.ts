import { InstanceObject, Metadata } from "./models/pure/common";
import { FieldsMetadataTransform } from "./models/pure/metadata-transform";
import { transformMetadata as realTransformMetadata } from "./processing/transform-metadata";
// import { transformDraft as realTransformDraft } from "./processing/transform-draft";

type Context = {
  _metadata: Metadata;
  _object: InstanceObject;
  _oldObject: InstanceObject;
};

const factory = (ctx: Context) => ({
  transformMetadata: (metadataTransform: FieldsMetadataTransform) => {
    if (ctx._metadata === undefined)
      throw new Error("_metadata não está definido");

    if (ctx._object === undefined)
      throw new Error("_object não está definido");

    realTransformMetadata(ctx._metadata, ctx._object, metadataTransform);
  },

  // transformDraft: (metadataTransform: MetadataTransform) => {
  //   if (ctx._oldObject === undefined)
  //     throw new Error("_oldObject não está definido");

  //   if (ctx._object === undefined)
  //     throw new Error("_object não está definido");

  //   realTransformDraft(ctx._object, ctx._oldObject, metadataTransform);
  // },
});

export = factory;
