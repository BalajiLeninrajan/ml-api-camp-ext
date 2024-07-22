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
- Create an IAM user with AWS Management Console access and manually attach:
    - AmazonRekognitionFullAccess
    - AmazonTextractFullAccess
    - AmazonBedrockFullAccess
    - AWSMarketplaceFullAccess
- Open the generated console sign-in URL in a different browser (or use an incognito window)
- Use the username and console password shown to login
- The remaining instructions are in the provived materials

## Lab3: Adding Amazon Bedrock to an existing web app
### Add a new button to use a LLM to generate summaries from lables and text generated with cv and ocr
- Documentaion, ariticles & workshops:
    - [Bedrock user guide](https://docs.aws.amazon.com/pdfs/bedrock/latest/userguide/bedrock-ug.pdf)
    - [Bedrock workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/a4bdb007-5600-4368-81c5-ff5b4154f518/en-US/010-intro)
    - [Build a Generative AI Enabled Web App Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/ed533291-e036-4086-8bb6-23b135f71e5d/en-US/4-workflow-1)
    - [Post about implementing the Gen AI workshop](https://medium.com/@sumbul.first/generative-ai-enabled-web-app-81820cbe25d6)
    - [Post about bedrock workshop](https://medium.com/@dminhk/amazon-bedrock-workshop-getting-started-ffcf77982857)
    - [BedrockRuntimeClient class](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-bedrock-runtime/Class/BedrockRuntimeClient/)
### Instructions
- Log in to the IAM user's console
- Navigate to the Bedrock service page (Services > ML > Bedrock; or just search it)
- Click on the "Get Started" button in the "Try Bedrock" card
- On the pop-up on the next page select "Manage model access"
- Press the "Enable pecific models" button near the top of the next page
- Select the desired model(TBD) and click next
    - Anthropic models will require additional information
- Once you hit "Submit", you should have access to the model
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
        const modelId = "amazon.titan-text-lite-v1"; // The foundation model we want to use(TBD)
            const prompt = // The prompt we're going to send to the LLM
                "Write a caption for an image picturing the phrases " +
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
