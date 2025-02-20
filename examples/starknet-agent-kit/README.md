# System Flow:

- Human prompt a local agent: "what is strk's current block number?"
 
- The local agent generate a response into a drp
- a remote agent picks up the response in the drp, prompts itself, and generates another response to put into the drp
- the local agent picks up the response from the remote agent in the drp
- the local agent acknowledges the human

# DRP State:

DRP acts as a conversation memory for agents. Each agent retrieves context from DRP and generates prompts based on stored conversation history.

- User request
- Local agent response
- Remote agent response
- Conversation state (finish?)

```
# Context
user 12D3KooWHMX6h5zQ4RDGZe1NYpnmYtBBPoUcGKQrPKqZhoqPJNEW: Hi How are you? Can you speak English? Can you give me current Starknet block?
agent 12D3KooWHMX6h5zQ4RDGZe1NYpnmYtBBPoUcGKQrPKqZhoqPJNEW: Sorry i can't do this!
```

Then other peers will read all conversation and give the answer:

```
agent 12D3KooWCjZ2ZarBFi9F8h19ehkKYiXmR4XFvTWWCxMdvCvNN3cu: Current Starknet block number is: 1167076
```