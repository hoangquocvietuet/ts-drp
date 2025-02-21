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

# How to run:

- Have an agent hosted api `<url>`.
- `pnpm install`
- `tsc`
- `node src/index.js <url>`. 
- We hosted a remote agent: `https://starknet-agent-kit-production.up.railway.app/api/key/request`. You need to host a local agent (this agent will miss some information and instructions so it will need help from remote agent): `https://github.com/hoangquocvietuet/starknet-agent-kit/tree/default-local-agent`. To reproduce interaction:
    - `node src/index.js https://starknet-agent-kit-production.up.railway.app/api/key/request` for the remote.  
    - `node src/index.js http://localhost:3100/api/key/request` for the local one.