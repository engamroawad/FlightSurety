import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
       // this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
          this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.FlightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback,config.appAddress);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.buyer='0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE';
    }

    initialize(callback,appdaddr) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];
            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
            this.authorizeContract(appdaddr,callback)
        });
    }

    authorizeContract(contract_address,callback){
        let self = this;
        self.FlightSuretyData.methods
        .authorizeContract(contract_address).send({ from: self.owner}).then(callback).catch(function(err) {
            console.log(err.message);
            });
    }

    fund(callback){
        let self = this;
        self.flightSuretyApp.methods
        .fund().send({ from: self.airlines[0], value:self.web3.utils.toWei("10.0", "ether")}).then(callback).catch(function(err) {
            console.log(err.message);
            });
    }


    registerAirline(airline,callback) {
        let self = this;
        self.flightSuretyApp.methods
        .registerAirline(airline).send({ from: self.airlines[0]}).then(callback).catch(function(err) {
            console.log(err.message);
            });
    }

    registerFlight(fligth,callback) {
        let self = this;
        self.flightSuretyApp.methods
        .registerFlight(fligth).send({ from: self.airlines[0]}).then(callback).catch(function(err) {
            console.log(err.message);
            });
    }

    buyInsurance(fligth,callback) {
        let self = this;
        self.flightSuretyApp.methods
        .buyInsurance(self.airlines[0],fligth).send({ from:  this.buyer , value:self.web3.utils.toWei("0.5", "ether"), gas: 2000000 }).then(callback).catch(function(err) {
            console.log(err.message);
            });
    }

    Debit(callback) {
        let self = this;
        self.flightSuretyApp.methods
        .debit(self.web3.utils.toWei("0.5", "ether")).send({ from:  this.buyer }).then(callback).catch(function(err) {
            console.log(err.message);
            });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    registerEventListner(callback){
        let self = this;
        self.flightSuretyApp.events.FlightStatusInfo({
            fromBlock: 0
          }, function (error, event) {
            if (error) {
                console.log(error)
            }else{
                callback(event);
            }
           
          });

          self.flightSuretyApp.events.OracleReport({
            fromBlock: 0
          }, function (error, event) {
            if (error) {
                console.log(error)
            }else{
                callback(event);
            }
           
          });
    }
}