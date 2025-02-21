import fs from "fs";
import readline from "readline";

import { ChatDRP, Message } from "./chat.drp.js";
import { agentPrompt, userPrompt } from "./prompts.js";
import { DRPNode } from "../../../packages/node/dist/src/index.js";

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
				level: "silent",
			},
		},
	});
	await drpNode.start();
	console.log("peerId", drpNode.networkNode.peerId);
	const drpObject = await drpNode.createObject({
		drp: new ChatDRP(),
		id: "chat",
	});
	chatDRP = drpObject.drp as ChatDRP;
}

const url = process.argv[2];

async function getResponse(request: string) {
	console.log(url);
	if (!url) return;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": "YOUR_SERVER_API_KEY",
		},
		body: JSON.stringify({
			request,
		}),
	}).then(async (res) => await res.json());
	const output = JSON.parse(res.output[0].text);
	const output_text = output.output[0].text;
	return output_text;
}

async function processRequest(input: string) {
	const userMessageId = Math.random().toString(36).substring(7);
	chatDRP.newMessage({
		peerId: drpNode.networkNode.peerId,
		from: "user",
		messageId: userMessageId,
		content: input,
        end: false,
	});
	const response = await getResponse(userPrompt(input));
	const agentMessageId = Math.random().toString(36).substring(7);
	chatDRP.newMessage({
		peerId: drpNode.networkNode.peerId,
		from: "agent",
		messageId: agentMessageId,
		content: response,
		parentMessageId: userMessageId,
        end: (response as string).includes("No")? false: true,
	});
}

function composeState(conversation: Message[]) {
	let res = "# Conversation\n";
	for (const message of conversation) {
		res += `${message.from} ${message.peerId}: ${message.content}\n`;
	}
	return res;
}

async function tryAnswer() {
	while (true) {
		const conversations = chatDRP.query_unresponded_conversations(drpNode.networkNode.peerId);
		for (const conversation of conversations) {
			const lastMessage = conversation[conversation.length - 1];
			const state = composeState(conversation);
			const response = await getResponse(agentPrompt(state));
			const newMessageId = Math.random().toString(36).substring(7);
			chatDRP.newMessage({
				peerId: drpNode.networkNode.peerId,
				from: "agent",
				messageId: newMessageId,
				content: response,
				parentMessageId: lastMessage.messageId,
                end: true,
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
		if (!conversation.length) {
			continue;
		}
		if (conversationCache.length != conversation.length) {
			conversationCache = conversation;
			fs.writeFileSync("conversation.txt", composeState(conversation));
			continue;
		}
	}
}

async function main() {
	await init();
	tryAnswer();
	updateConversation();
	const loop = () => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question("Enter your message: ", async (input) => {
			try {
				console.log("all peers", drpNode.networkNode.getAllPeers());
				await processRequest(input);
			} catch (error) {
				console.log("Error:", error);
			}
			if (input === "exit") {
				rl.close();
			} else {
				rl.close();
				loop(); // Call main again to prompt for the next message
			}
		});
	};
	try {
		loop();
	} catch (error) {
		console.log("Error:", error);
	}
}

main();
