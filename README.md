# Bot Deployment Challenge

## Description

This bot detects every time a Forta bot is deployed by the Nethermind deployer

## Supported Chains

- Polygon

## Alerts

- NETHERMIND-FORTA-BOT
  - Fired when the Nethermind Deployment address at : "0x88dc3a2284fa62e0027d6d6b1fcfdd2141a143b8", deploys a Forta bot at the proxy address at : "0x61447385B019187daa48e91c55c02AF1F1f3F863" 
  - Severity is always set to "info" 
  - Type is always set to "info" 
  - Metadata fields
    - `agentId`: agentId of the deployed bot
    - `metadata`: ipfs of the metadata of the bot
    - `chainIds`: list of supported chains

## Test Data

The bot behaviour can be verified with the following transactions:

- [0xcd465522efdec8caa54cff9d60683ba9a5638830e83962582851f9fa9291c8cd](https://polygonscan.com/tx/0xcd465522efdec8caa54cff9d60683ba9a5638830e83962582851f9fa9291c8cd) (`CreateAgent` Function)
