<p align="center"> 
  <img src="https://i.imgur.com/TBapjYI.png" alt="Cosmostation logo">
</p>
<h1 align="center">
  Cosmos-faucet
</h1> 

<p align="center">
⭐ Cosmos-faucet is a simple alternative to the tendermint/faucet script.  
This is an idea adapted for ➡️ <a href="https://www.bitcanna.io/">Bitcanna</a> and can be used for any project using cosmos.  
  
</p>


## Prerequisites

node version >=18.0.0

## Installation

```sh
git clone https://github.com/atmoner/cosmos-faucet.git
cd cosmos-faucet
npm install
```
## Config
```sh
nano config.json
```
Edit this part with your value:
```
{
  "name": "Bitcanna Testnet",
  "mnemonic": "",
  "chainId": "bitcanna-dev-1", 
  "lcdUrl": "https://lcd-testnet.bitcanna.io",
  "rpcUrl": "https://rpc-testnet.bitcanna.io",
  "denom": "ubcna",
  "prefix": "bcna",
  "gasPrice": 0.075,
  "faucetAmount": 1000000,
  "memo": "Faucet from cosmos-faucet",
  "enableUi": false,
  "enableSwagger": true,
  "dappPort": "8000"
} 
```
## Run it (server side)
```
node app.js
```
## Client request
```
curl -s "http://testnet-faucet.bitcanna.io:8000/faucet/claim/bcna1xvuxv4znmmeu96ulxhldvyt32whp57vhyzg5vh" | jq
```
