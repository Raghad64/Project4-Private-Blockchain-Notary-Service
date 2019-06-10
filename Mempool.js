const bitcoinMessage = require('bitcoinjs-message');

const TimeoutRequestWindowTime = 5*60*1000;
const TimeoutValidWindowTime = 30*60*1000;

class Mempool{

  constructor(){
  this.mempool = [];
  this.timeoutRequest = [];
  this.mempoolValid = [];
  this.timeoutValid = [];

  //this.addRequestValidation();
  }
  //A new validation request 
  addRequestValidation(address){

  if (address in this.mempool){

    const req = this.mempool[address];
    let timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.requestTimeStamp;
    let timeLeft = (TimeoutRequestWindowTime/1000) - timeElapse;
    req.validationWindow = timeLeft;
    return req;
  } else {

    let timeStamp = new Date().getTime().toString().slice(0,-3);
    const req = {
    "address": address,
    "requestTimeStamp": timeStamp,
    "message": `${address}:${timeStamp}:starRegistry`,
    "validationWindow": TimeoutRequestWindowTime/1000
    }

    this.mempool[address] = req;
    console.log(req);
    //remove from mempool
    this.timeoutRequest[req.address] = setTimeout(() => this.removeRequestValidation(req.address), TimeoutRequestWindowTime)
    return req;
  }
  }
  //When request is timed out 
  removeRequestValidation(address){

  this.mempool = this.mempool.filter(rem => rem.address !== address);
  }

  validateRequestByWallet(address, signature){
  console.log(this.mempool);
  console.log(this.mempoolValid);
  if (address in this.mempoolValid) {

    if (bitcoinMessage.verify(this.mempoolValid[address].status.message, address, signature)){
    const req = this.mempoolValid[address];
    console.log(req);

    let timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.status.requestTimeStamp;
    let timeLeft = (TimeoutValidWindowTime/1000) - timeElapse;
    req.status.validationWindow = timeLeft;

    return req;
    } else {

    return {'message': 'Error: Signature invalid'};
    }
  }

  if (address in this.mempool) {
    if (bitcoinMessage.verify(this.mempool[address].message, address, signature)){

    const req = {
      'registerStar': true,
      'status': Object.assign({},
      this.mempool[address],
      {'validationWindow': TimeoutValidWindowTime/1000,
      'messageSignature': 'valid',
      })
    }

    clearTimeout(this.timeoutRequest[address]);
    this.removeRequestValidation(address);
    this.mempoolValid[address] = req;
    this.timeoutValid[address] = setTimeout(() => this.removeRequestByWallet(address), TimeoutValidWindowTime)
    return req;
    
    } else {
    return {'message': 'Error: Signature invalid'};
    } 
  } else {
    return {'message': 'Error: validation request expired or has not been created'};
  }
  }

  removeRequestByWallet(address){

  //Remove redundant address request
  this.mempoolValid = this.mempoolValid.filter(element => element.address !== address);
  }

  verifyAddressRequest(address){
  return (address in this.mempoolValid);
  }

  removeAddressRequest(address){
  clearTimeout(this.timeoutValid[address]);
  this.removeRequestByWallet(address);

  }
}

module.exports = Mempool;