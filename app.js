import fs from 'fs';
import axios from 'axios'; 
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJsdoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
import { DirectSecp256k1HdWallet, coin, coins } from "@cosmjs/proto-signing";
import { bech32 } from "bech32";
import pkg from '@cosmjs/stargate';
const { assertIsDeliverTxSuccess, SigningStargateClient, defaultRegistryTypes, GasPrice } = pkg; 

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);


function checkBech32Address(address) {
  try {
    bech32.decode(address);
    return true;
  } catch (error) {
    return false;
  }
}
function checkBech32Prefix(address) {
  try {
    const { prefix } = bech32.decode(address); 
    if (prefix === config.prefix) {
      return true;
    } 
  } catch (error) {
    return false;
  }
}

app.get('/faucet/ui', async function(req, res) { 
  if (config.enableUi) {
    res.sendFile(path.join(__dirname, '/claim.html'));
  } else {
    res.status(403).send('Forbidden');
  }
  
}) 

app.get('/faucet/available', async function(req, res) { 
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(config.mnemonic, { prefix: config.prefix, path: "m/44'/118'/0'/0/0" });
  const [firstAccount] = await wallet.getAccounts();

  const account = await axios.get(config.lcdUrl + '/cosmos/bank/v1beta1/spendable_balances/' + firstAccount.address)  
  let available = 0;
  account.data.balances.forEach(function (balance) {
    if (balance.denom == config.denom) {
      available = balance.amount;
    }
  })
  res.json({ 
    available: available
  })
}) 

app.get('/faucet/last-claim', async function(req, res) { 
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(config.mnemonic, { prefix: config.prefix });
  const [firstAccount] = await wallet.getAccounts();

  const resultSender = await axios(
    config.lcdUrl +
      "/cosmos/tx/v1beta1/txs?events=message.sender=%27" +
      firstAccount.address +
      "%27&limit=10&order_by=2"
  );
  res.json({ 
    lastclaim: resultSender.data
  })
}) 

app.get('/faucet/claim/:address', async function(req, res) { 
  console.log("Request received for address:", req.params.address); // Verify address received

  let addressTo = req.params.address;   
  if (!checkBech32Address(addressTo)) {
    console.log("Invalid address detected:", addressTo); // Look if address is valid
    res.status(403).json({ 
      result: "Invalid address"
    })
    return;
  } 

  if (!checkBech32Prefix(addressTo)) {
    console.log("Invalid address prefix detected:", addressTo); // Look if preix is valid
    res.status(403).json({ 
      result: "Invalid address prefix"
    })
    return;
  }

 
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(config.mnemonic, { prefix: config.prefix });
  const [firstAccount] = await wallet.getAccounts();
  const client = await SigningStargateClient.connectWithSigner(config.rpcUrl, wallet, {
    gasPrice: GasPrice.fromString(
      config.gasPrice + config.denom
    ) 
  }); 

  const foundMsgType = defaultRegistryTypes.find(
    (element) => element[0] === "/cosmos.bank.v1beta1.MsgSend"
  )

  const finalMsg = {
    typeUrl: foundMsgType[0],
    value: foundMsgType[1].fromPartial({
      "fromAddress": firstAccount.address,
      "toAddress": addressTo,
      "amount": coins(config.faucetAmount, config.denom)
    }),
  } 
  const result = await client.signAndBroadcast(firstAccount.address, [finalMsg], "auto", "")
  assertIsDeliverTxSuccess(result);
  console.log(result)
  res.json({ 
    result: result.transactionHash
  })
})

if (config.enableSwagger) {
  // Swagger
  const options = {
    definition: { 
      openapi: "3.1.0",
      info: {
        title: config.name + " faucet",
        version: "0.1.0", 
      }, 
    },
    apis: ["./routes/*.js"],
  };

  const specs = swaggerJsdoc(options);
  app.use(
    "/",
    serve,
    setup(specs, { explorer: false })
  );  
} 

app.listen(config.dappPort, () => {
  console.log(config.name + ` faucet app listening on port ${config.dappPort}`);
})
