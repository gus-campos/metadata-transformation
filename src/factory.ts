import { InstanceObject, Metadata } from "./models/pure/common";
import {
    SlimFieldsMetadataTransform,
    toFieldsMetadataTransform,
} from "./models/slim/slim-metadata-transform";
import { transformMetadata as realTransformMetadata } from "./processing/transform-metadata";
// import { transformDraft as realTransformDraft } from "./processing/transform-draft";

type Context = {
    _metadata: Metadata;
    _object: InstanceObject;
    _oldObject: InstanceObject;
};

const factory = (ctx: Context) => ({
    transformMetadata: (slimMetadataTransform: SlimFieldsMetadataTransform) => {
        if (ctx._metadata === undefined)
            throw new Error("_metadata não está definido");

        if (ctx._object === undefined)
            throw new Error("_object não está definido");

        realTransformMetadata(
            ctx._metadata,
            ctx._object,
            toFieldsMetadataTransform(slimMetadataTransform),
        );
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
