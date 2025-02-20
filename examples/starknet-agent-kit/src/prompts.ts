export const userPrompt = (input: string) => {
	return `I am user and you are a Starknet agent. I am asking you: ${input}. If you know the answer, please respond. If you don't the answer, please reply with "No", don't include any other information.`;
};

export const agentPrompt = (state: string) => {
	return `You are a Starknet agent. Given context ${state}. If you know the answer, please respond. If you don't the answer, please reply with "No", don't include any other information.`;
};
