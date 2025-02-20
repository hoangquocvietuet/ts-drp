import { ActionType, DRP, ResolveConflictsType, SemanticsType, Vertex } from "../../../packages/object/dist/src/index.js";

interface UserMessage {
    from: string;
    id: string;
    content: string;
}

interface AgentMessage {
    from: string; 
    id: string;
    request_id?: string;
    content: string;
    need_response: boolean;
}

export class ChatDRP implements DRP {
    semanticsType = SemanticsType.pair;
    agentMessages: AgentMessage[];
    userMessages: UserMessage[];
    
	resolveConflicts(_: Vertex[]): ResolveConflictsType {
		return { action: ActionType.Nop };
	}

    constructor() {
        this.agentMessages = [];       
        this.userMessages = [];
    }

    newAgentMessage({
        from,
        id,
        request_id,
        content,
        need_response,
    }: {
        from: string;
        id: string;
        request_id?: string;
        content: string;
        need_response: boolean;
    }): void {
        this.agentMessages.push({
            from,
            id,
            request_id,
            content,
            need_response
        });
    }

    newUserMessage({
        from,
        id,
        content
    }: {
        from: string;
        id: string;
        content: string;
    }): void {
        this.userMessages.push({
            from,
            id,
            content
        });
    }

    query_unrespondedMessages = (from: string) => {
        const notFrom = this.agentMessages.filter((m) => m.from !== from);
        return notFrom.filter((m) => !this.agentMessages.some((m2) => m2.request_id === m.id) && m.need_response === true);
    }

    query_conversation = (from: string) => {
        const conversation = [];
        const userMessages = this.userMessages.filter((m) => m.from === from);
        console.log('userMessages:', userMessages);
        for (const userMessage of userMessages) {
            conversation.push(`User ${userMessage.from}: ${userMessage.content}`);
            const agentMessage = this.agentMessages.find((m) => m.request_id === userMessage.id);
            if (agentMessage) {
                conversation.push(`Agent ${agentMessage.from}: ${agentMessage.content}`);
                const agentReply = this.agentMessages.find((m) => m.request_id === agentMessage.id);
                if (agentReply) {
                    conversation.push(`Agent ${agentReply.from}: ${agentReply.content}`);
                }
            }
            conversation.push('\n');
        }
        return conversation;
    }
}