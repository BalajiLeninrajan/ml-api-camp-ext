# ML API CAMP

## Setup
- Useful Documentation:
    - [Introduction to Vue](https://vuejs.org/guide/introduction.html)
    - [Creating an AWS account](https://repost.aws/knowledge-center/create-and-activate-aws-account)
    - [Creating an IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html#id_users_create_console)
    - [AWS JavaScript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
### Instuctions
- Clone this repo
- Create an AWS account and activate it (Skip if already done)
- Create an IAM user and manually attach:
    - AmazonRekognitionFullAccess
    - AmazonTextractFullAccess
    - AmazonBedrockFullAccess
- Create an access key for the IAM user
- Copy the access key and secret access key

## Lab3: Adding Amazon Bedrock to an existing web app
### Add a new button to use a LLM to generate summaries from lables and text generated with cv and ocr
- Documentaion, ariticles & workshops:
    - [Bedrock user guide](https://docs.aws.amazon.com/pdfs/bedrock/latest/userguide/bedrock-ug.pdf)
    - [BedrockRuntimeClient class](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-bedrock-runtime/Class/BedrockRuntimeClient/)
### Instructions
- Open your AWS Console Dashboard
- Navigate to the Bedrock service page (Services > ML > Bedrock; or just search it)
- Click on the "Get Started" button in the "Try Bedrock" card
- On the pop-up on the next page select "Manage model access"
- Press the "Enable specific models"/"Modify model access" button near the top of the next page
- Select the desired model (Llama 3 8B Instruct) and click next
    - Feel free to try other models Bedrock offers!
    - Anthropic models will require additional information
- Once you hit "Submit", you should have access to the model
- **Ask for help if you have trouble with the previous steps**
- Install Bedrock SDK modules
    ```js
    // add this to the top of AmazonML.js
    import {
        BedrockRuntimeClient,
        ConverseCommand,
    } from "@aws-sdk/client-bedrock-runtime";
    ...
    ```
- Add Bedrock Client Initialization and Configuration
    ```js
    ...
    let bedrockClient = null;
    export async function generateCaptionML(textData, labelData) {
        let returnData = null;
        try {
            if (!bedrockClient) bedrockClient = new BedrockRuntimeClient(creds); // creates Bedrock Client if one already doesn't exist
            // TODO 
        } catch (error) {
            returnData = {
                type: "error",
                text: error.message,
            };
        }
        return JSON.stringify(returnData);
    }
    ...
    ```
- Configure parameters for the Converse Command
    ```js
    ...
    export async function generateCaptionML(textData, labelData) {
        const modelId = "meta.llama3-8b-instruct-v1:0"; // The foundation model we want to use
            const prompt = // The prompt we're going to send to the LLM
                "Write a very short and descriptive caption for an image picturing the phrases " +
                textData.join(", ") + // Adding the texTract results to the prompt
                ". Parts of the image were labeled, the labels are " +
                labelData.join(", ") + // Adding the rekognition results to the prompt
                ". Don't show the prompt, only the caption. Do not add anything like Here is a caption... just return the caption alone";
            const params = {
                modelId,
                messages: [
                    {
                        role: "user",
                        content: [{ text: prompt }],
                    },
                ],
        };
        let returnData = null;
    ...
    ``` 
- Create and instance of the command and send it to the client
    ```js
    try {
        if (!bedrockClient) bedrockClient = new BedrockRuntimeClient(creds);
        const query = new ConverseCommand(params);
        let response = await bedrockClient.send(query);
        returnData = {
            type: "success",
            text: response,
        };
    } catch (error) {
    ```
