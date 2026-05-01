import { metadataTransform } from "./example.js";
import { processMetadata } from "./process-metadata.js";

const metadata = {
    fields: {
        myInstallmentPlanWas: {
            
        }
    }
};
const object = {};

console.log("\n\n\n\n")

console.log(JSON.stringify(metadataTransform, null, 2));
console.log(JSON.stringify(metadata, null, 2));

console.log("\n\n\n\n")

processMetadata(metadata, metadataTransform, object);
console.log(JSON.stringify(metadata, null, 2));