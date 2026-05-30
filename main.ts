import { toMetadataTransform } from "./src/models/shotcutted/slim-metadata-transform";

const result = toMetadataTransform({
  teste: {
    _apply: {},
  },
});

console.log(JSON.stringify(result, null, 4));
