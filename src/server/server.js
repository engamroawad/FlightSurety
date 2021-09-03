import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
var cors = require('cors')

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function searchOracle(oracleindex, inindex) {
  for (let i = 0; i < 3; i++) {
   // console.log("index "+oracles[oracleindex].index[i]+"got "+ parseInt(inindex));
    if (oracles[oracleindex].index[i] == parseInt(inindex)) {
    
      return i;
    }
  }
  return -1;
}

let oracles = [
  {
    address: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
    index: []
  },
  {
    address: '0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e',
    index: []
  },
  {
    address: '0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5',
    index: []
  },
  {
    address: '0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5',
    index: []
  },

]

console.log("Server started")

for (let i = 0; i < 4; i++) {
  //let self=this
  console.log('oracle address ' + i + oracles[i].address);
  flightSuretyApp.methods.registerOracle().send({ from: oracles[i].address, value: web3.utils.toWei("1.0", "ether"), gas: 2000000 })
    .then((result) => {
      flightSuretyApp.methods.getMyIndexes().call({ from: oracles[i].address },
        (error, result) => {
         
          oracles[i].index.push(result[0]);
          oracles[i].index.push(result[1]);
          oracles[i].index.push(result[2]);
          console.log('indecies ' + result);
        });
    }).catch(function (err) {
      console.log(err.message);
    }
    );
}


flightSuretyApp.events.OracleRequest({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error)
  console.log(event.returnValues)
  for (let i = 0; i < 4; i++) {
    let j = searchOracle(i, event.returnValues.index)
    if (j >= 0) {
      console.log("found index "+event.returnValues.index);
      let response = getRandomInt(6) * 10;
      flightSuretyApp.methods.submitOracleResponse(event.returnValues.index, event.returnValues.airline, event.returnValues.flight,
        event.returnValues.timestamp, response).send({ from: oracles[i].address }).then((result) => {
          console.log("submitted oracle response " + response);
        }).catch(function (err) {
          console.log(err.message);
        }
        );
    }
  }
});


const app = express();
app.use(cors())
///no need for this !!!!!
app.get('/api', (req, res) => {
  res.send({
    message: 'An API for use with your Dapp!'
  })
})

export default app;


