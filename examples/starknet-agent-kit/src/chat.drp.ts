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
	end: boolean;
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

    /*
        Get all messages from a specific peer
        First message is the message from the user
        Subsequent messages are the messages from the agent. They are linked with the parentMessageId
    */
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

    /*
        Get all conversations that have not been responded to
        Unresponded conversations are conversations where the last message is not end and is not from current peer
        End state is set by the agent
    */
	query_unresponded_conversations(_peerId: string) {
		const allPeerId = this.messages.map((message) => message.peerId);
		// unique peerId
		const uniquePeerId = [...new Set(allPeerId)];
		const conversations = [];
		for (const peerId of uniquePeerId) {
			if (peerId === _peerId) continue;
			const conversation = this.query_conversation(peerId);
            if (conversation.length === 0) continue;
			const lastMessage = conversation[conversation.length - 1];
			if (lastMessage.peerId === _peerId) continue;
            if (lastMessage.from === 'user') continue;
			if (!lastMessage.end) {
				conversations.push(conversation);
			}
		}
		return conversations;
	}
}
