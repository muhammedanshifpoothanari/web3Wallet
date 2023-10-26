
const { Web3 } = require('web3')
const dotenv = require('dotenv');
dotenv.config();
const ContractAbi = require('../../../contractAbi.json')
const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

let yourAccountAddress = '0x267B5559d5568f26D4Fe21bB48440C78bFfBa7ff';
let yourAccountPrivateKey = '0x7a1c9fac42d144bd3218b233020592aa917cecfab50c7dc469e93d7acd770bed';

// Set the default account for transactions
web3.eth.accounts.wallet.add(yourAccountPrivateKey);
web3.eth.defaultAccount = yourAccountAddress;

const myContract = new web3.eth.Contract(ContractAbi,`${process.env.CONTRACTADDRESS}`);

async function transfer(to, value) {
    const receipt = await myContract.methods.transfer(to, value).send({ from: yourAccountAddress });
    return receipt;
  }

  module.exports = { transfer }