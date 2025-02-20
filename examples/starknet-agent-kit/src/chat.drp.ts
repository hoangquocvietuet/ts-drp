import {
	ActionType,
	DRP,
	ResolveConflictsType,
	SemanticsType,
	Vertex,
} from "../../../packages/object/dist/src/index.js";

export interface Message {
	peerId: string;
	from: "user" | "agent";
	messageId: string;
	content: string;
	parentMessageId?: string;
	end?: boolean;
}

export class ChatDRP implements DRP {
	semanticsType = SemanticsType.pair;
	messages: Message[];

	resolveConflicts(_: Vertex[]): ResolveConflictsType {
		return { action: ActionType.Nop };
	}

	constructor() {
		this.messages = [];
	}

	newMessage(message: Message) {
		this.messages.push(message);
	}

	query_conversation(peerId: string) {
		const userMessages = this.messages.filter(
			(message) => message.peerId === peerId && message.from === "user"
		);
		const conversation = [];
		for (const message of userMessages) {
			const firstMessage = message;
			let currentMessage = firstMessage;
			while (currentMessage) {
				conversation.push(currentMessage);
				const nextMessage = this.messages.find(
					(message) => message.parentMessageId === currentMessage.messageId
				);
				if (!nextMessage) break;
				currentMessage = nextMessage;
			}
		}
		return conversation;
	}

	query_unresponded_conversations(_peerId: string) {
		const allPeerId = this.messages.map((message) => message.peerId);
		// unique peerId
		const uniquePeerId = [...new Set(allPeerId)];
		const conversations = [];
		for (const peerId of uniquePeerId) {
			if (peerId === _peerId) continue;
			const conversation = this.query_conversation(peerId);
			const lastMessage = conversation[conversation.length - 1];
			if (lastMessage.peerId === peerId) continue;
			if (!lastMessage.end) {
				conversations.push(conversation);
			}
		}
		return conversations;
	}
}
