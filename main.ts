import { toMetadataTransform } from "./src/models/shotcutted/shortcutted-metadata-transform";

const result = toMetadataTransform({
    "teste": {
        _apply: {
            readOnly: true
        }
    }
});


console.log(JSON.stringify(result));