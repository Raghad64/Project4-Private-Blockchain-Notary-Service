
const express = require('express');
const bodyParser = require('body-parser');
//const app = express();

// const Block = require('./Block');
// const Blockchain = require('./BlockChain');
// const Mempool = require('./Mempool');
// const hex2ascii = require('hex2ascii');

class BlockChainAPI{

  constructor(){
    this.app = express();
    this.initExpress();
    this.initExpressMiddleWare();
    this.initControllers();
    this.start();
  }

  initExpress(){
    this.app.set('port', 8000)
  }

  initExpressMiddleWare(){
    this.app.use(bodyParser.urlencoded({extended:true}));
    this.app.use(bodyParser.json());

    // this.app.use('/Mempool');

    
  }

  initControllers(){
    require('./Blockcontroller.js')(this.app);
    //require('./Mempool.js')(this.app);
  }

  start(){
    let self = this;
    this.app.listen(this.app.get('port'), () => {
      console.log('Listening on port 8000');
    });
  }
}

new BlockChainAPI();