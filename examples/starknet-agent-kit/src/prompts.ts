export const userPrompt = (input: string) => {
    return `I am user and you are a Starknet agent. I am asking you: ${input}. If you know the answer, please respond. If you don't the answer, please reply with "No", don't include any other information.`
}

export const agentPrompt = (userMessage: String) => {
    return `I am a Starknet agent. I received a message from user: ${userMessage}. Can you help me with this? Please answer the question.`
}

// export const agentRespondMessage = (message: string) => {
//     return `
//         The answer to the question is: ${message}
//     `
// }