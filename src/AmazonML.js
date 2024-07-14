import { Buffer } from "buffer";
import {
    RekognitionClient,
    DetectLabelsCommand,
} from "@aws-sdk/client-rekognition";
import {
    DetectDocumentTextCommand,
    TextractClient,
} from "@aws-sdk/client-textract";
import {
    BedrockRuntimeClient,
    ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const creds = {
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
};

let rekognitionClient = null;
let textractClient = null;
let bedrockClient = null;

export async function analyzeImageML(type, imageData) {
    const uimage_bytes = base64ToUint8Array(
        imageData.split("data:application/octet-stream;base64,")[1]
    );
    const params = {
        Image: { Bytes: uimage_bytes },
        MaxLabels: 10,
        MinConfidence: 80,
    };

    var returnData = null;
    try {
        if (type == "labels") {
            // If the client has not been initalized yet, create it
            if (!rekognitionClient)
                rekognitionClient = new RekognitionClient(creds); // pass in the creds as parameter
            const query = new DetectLabelsCommand(params);
            let response = await rekognitionClient.send(query);
            returnData = {
                type: "success",
                text: response,
            };
        } else if (type == "text") {
            if (!textractClient) textractClient = new TextractClient(creds);
            const params = {
                Document: { Bytes: uimage_bytes },
            };
            const query = new DetectDocumentTextCommand(params);
            let response = await textractClient.send(query);
            returnData = {
                type: "success",
                text: response,
            };
        }
    } catch (error) {
        returnData = {
            type: "error" /* success info warning error */,
            text: error.message,
        };
    }
    return JSON.stringify(returnData);
}

export async function generateCaptionML(textData, labelData) {
    const modelId = "amazon.titan-text-lite-v1";
    const prompt = ```
    Write a caption for an image picturing the phrases ${textData.join(", ")}.
    Parts of the image were labled, the labels are ${labelData.join(", ")}.
    Don't show the prompt, only the caption. Do not add anything like Here is a caption... just return the caption alone
    ```;
    const params = {
        modelId,
        messages: [
            {
                role: "user",
                content: [{ text: prompt }],
            },
        ],
    };
    var returnData = null;
    try {
        if (!bedrockClient) bedrockClient = new BedrockRuntimeClient(creds);
        const query = new ConverseCommand(params);
        let response = await bedrockClient.send();
        returnData = {
            type: "success",
            text: response,
        };
    } catch (error) {
        returnData = {
            type: "error",
            text: error.message,
        };
    }
    return JSON.stringify(returnData);
}

// imageData is string with data:application/octet-stream;base64,...
function base64ToUint8Array(base64Data) {
    const decoded = Buffer.from(base64Data, "base64");
    const bytes = new Uint8Array(
        decoded.buffer,
        decoded.byteOffset,
        decoded.byteLength
    );
    return bytes;
}
