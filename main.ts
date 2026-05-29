import { toMetadataTransform } from "./src/models/shotcutted/shortcutted-metadata-transform";

const result = toMetadataTransform({
  teste: {
    _apply: {},
  },
});

console.log(JSON.stringify(result, null, 4));
