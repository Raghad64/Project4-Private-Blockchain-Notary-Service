/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

  constructor() {
    this.bd = new LevelSandbox.LevelSandbox();
    this.generateGenesisBlock();
  }

  // Helper method to create a Genesis Block (always with height= 0)
  // You have to options, because the method will always execute when you create your blockchain
  // you will need to set this up statically or instead you can verify if the height !== 0 then you
  // will not create the genesis block
  generateGenesisBlock(){
    // Add your code here
    try {
      this.getBlockHeight().then((height) => {
        if(height === -1) {
          this.addBlock(new Block.block('Fist block in the chain - Genesis Block')).then((result) => {
            console.log('Genesis block ' + result);
          });
        }
      })
    } catch(err) {
      console.log(err);
    } 
  }

  // Get block height, it is a helper method that return the height of the blockchain
  async getBlockHeight() {
    // Add your code here
    try {
      return await this.bd.getBlocksCount();
    } catch(err){
      console.log(err);
    }
  }

  // Add new block
  async addBlock(block) {
    // Add your code here
    try{
      let previousBlockHeight = await this.bd.getBlocksCount();
      block.height = previousBlockHeight + 1;
      block.time = new Date().getTime().toString().slice(0,-3);

      if (block.height > 0){
        let previousBlock = await this.getBlock(previousBlockHeight);
        block.previousBlockHash = previousBlock.hash;
      }
       block.hash = SHA256(JSON.stringify(block)).toString();
      previousBlockHeight = block.height
      return JSON.parse(await this.bd.addLevelDBData(block.height, JSON.stringify(block)));
    } catch (err){
      console.log(err)
    }
  }

  // Get Block By Height
   async getBlock(height) {
    // Add your code here
      return JSON.parse(await this.bd.getLevelDBData(height));
    
  }

  async getBlockByAddress(address) {
      //return JSON.parse(await this.bd.getBlockByAddress(address));
        return await this.bd.getBlockByAddress(address);
    }


    async getBlockByHash(hash) {
        return JSON.parse(await this.bd.getBlockByHash(hash));
    }

  // Validate if Block is being tampered by Block Height
  async validateBlock(height) {
    // Add your code here
    try{
      let block = await this.getBlock(height);
      let blockHash = block.hash;
      block.hash = '';
      let validBlockHash = SHA256(JSON.stringify(block)).toString();

      return new Promise((resolve, reject) => {
        if (blockHash === validBlockHash){
          console.log('Block is valid');
          resolve(true);
        } else {
          console.log('Invalid block ')
          resolve(false);
        }
      })
    } catch(err){
      console.log(err);
    }
  }

  // Validate Blockchain
  async validateChain() {
    // Add your code here
    try{
      let errLog = [];
      const height = await this.addBlock.bd.getBlocksCount();

      for(let i = 0 ; i < height ; i++){
        this.getBlock(i).then(async(block) => {
          if (!this.validateBlock(block.height)){
            errLog.push(i);
          };

          let blockHash = await this.bd.getLevelDBData(i).hash;
          let previousHash = await this.bd.getLevelDBData(i+1).previousBlockHash;
          if (blockHash !== previousHash){
            errLog.push(i);
          }
        })
      }
      if (errLog.length > 0){
        console.log('Error on block ' + errLog); 
      } else {
        console.log('No errors found');
      }
    } catch (err){
      console.log(err);
    }
  }

  // Utility Method to Tamper a Block for Test Validation
  // This method is for testing purpose
  _modifyBlock(height, block) {
    let self = this;
    return new Promise( (resolve, reject) => {
      self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
        resolve(blockModified);
      }).catch((err) => { console.log(err); reject(err)});
    });
  }
   
}

module.exports.Blockchain = Blockchain;
