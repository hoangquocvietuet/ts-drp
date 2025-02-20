import { DRPNode } from "../../../packages/node/dist/src/index.js";
import { DRPObject } from "../../../packages/object/dist/src/index.js";
import { ChatDRP } from "./chat.drp.js";
import readline from 'readline';
import { agentPrompt, userPrompt } from "./prompts.js";
import fs from 'fs';

let drpNode: DRPNode;
let chatDRP: ChatDRP;

async function init() {
    drpNode = new DRPNode({
        credential_config: {
            private_key_seed: Math.random().toString(36).substring(7),
        },
        network_config: {
            private_key_seed: Math.random().toString(36).substring(7),
            log_config: {
                level: 'silent'
            }
        }
    });
    await drpNode.start();
    console.log('peerId', drpNode.networkNode.peerId);
    const drpObject = await drpNode.createObject({
        drp: new ChatDRP(),
        id: 'chat',
    });
    chatDRP = drpObject.drp as ChatDRP;
}

const url = process.argv[2];

async function getResponse(request: string) {
    console.log(url);
    if (!url) return;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'YOUR_SERVER_API_KEY'
        },
        body: JSON.stringify({
            request,
        }),
    }).then(async res => await res.json());    
    const output = JSON.parse(res.output[0].text);
    const output_text = output.output[0].text;
    return output_text;
}

async function processRequest(input: string) {
    const response = await getResponse(userPrompt(input));
    const userMessageId = Math.random().toString(36).substring(7);
    chatDRP.newUserMessage({
        from: drpNode.networkNode.peerId,
        id: userMessageId,
        content: input,
    });
    const agentMessageId = Math.random().toString(36).substring(7);
    if (!response.includes("No")) {
        chatDRP.newAgentMessage({
            from: drpNode.networkNode.peerId,
            id: agentMessageId,
            request_id: userMessageId,
            content: response,
            need_response: false,
        });
    } else {
        chatDRP.newAgentMessage({
            from: drpNode.networkNode.peerId,
            id: agentMessageId,
            request_id: userMessageId,
            content: agentPrompt(input),
            need_response: true,
        });
    }
}

async function tryAnswer() {
    while (true) {
        const unrespondedMessages = chatDRP.query_unrespondedMessages(drpNode.networkNode.peerId);
        for (const message of unrespondedMessages) {
            const request_id = message.id;
            const response = await getResponse(message.content);
            chatDRP.newAgentMessage({
                from: drpNode.networkNode.peerId,
                id: Math.random().toString(36).substring(7),
                request_id: request_id,
                content: response,
                need_response: false,
            });
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}

let conversationCache: any = [];

async function updateConversation() {
    while (true) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // clear the file
        const conversation = chatDRP.query_conversation(drpNode.networkNode.peerId);
        if (conversationCache && conversationCache.length === conversation.length) {
            for (let i = 0; i < conversation.length; i++) {
                if (conversation[i] !== conversationCache[i]) {
                    fs.writeFileSync('conversation.txt', conversation.join('\n'));
                    break;
                }
            }
            continue;
        }
        fs.writeFileSync('conversation.txt', conversation.join('\n'));
    }
}

async function main() {
    await init();
    tryAnswer();
    updateConversation();
    const loop = () => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter your message: ', async (input) => {
            try {
                console.log('all peers', drpNode.networkNode.getAllPeers());
                await processRequest(input);
            } catch (error) {
                console.log('Error:', error);
            }
            if (input === 'exit') {
                rl.close();
            } else {
                rl.close();
                loop();  // Call main again to prompt for the next message
            }
        });
    }
    try {
        loop();
    } catch(error) {
        console.log('Error:', error);
    }}

main();