const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');
const Mempool = require('./Mempool.js');
const hex2ascii = require('hex2ascii');

const myBlockChain = new BlockChain.Blockchain();

let mempool = new Mempool();

//app.use(express.json())

class BlockController {
  constructor(app) {
    this.app = app;

    //this.initializeMockData();
    this.getBlockEndpoint();
    this.postBlockEndpoint();
    this.postRequestValidationEndpoint();
    this.postValidateMessageEndpoint();
    this.getStarByAddress();
    this.getStarByHash();
  }

  postRequestValidationEndpoint() {
    var self = this;

    this.app.post('/requestValidation', (req, res) => {

      const address = req.body.address;

      if (!address) {
        //res.status(400).json({message: "Error: request does not contain wallet address"});
        res.status(400).end(JSON.stringify({
          'message': 'Error: request does not contain wallet address'
        }));
        //return;
      } else {
        res.json(mempool.addRequestValidation(address));
      }
    });


  }

  postValidateMessageEndpoint() {
    var self = this;

    this.app.post('/message-signature/validate', (req, res) => {
      const address = req.body.address;
      const signature = req.body.signature;
      console.log('Address: ' + address + ' Signature' + signature);

      if (!address || !signature) {
        res.status(400).end(JSON.stringify({
          'message': 'Error: wallet address or signature was not provided'}));
        return;
      } else {
        res.json(mempool.validateRequestByWallet(address, signature));
      }

    });
  }
 
  postBlockEndpoint() {
    var self = this;

    this.app.post('/block', async(req, res) => {
      const address = req.body.address;
      const star = req.body.star;

      if (!address || !star) {
        res.status(400).end(JSON.stringify({
          'message': 'Error: wallet address or star was not provided'
        }));

      } else if (!star.dec || !star.ra || !star.story) {
        res.status(400).end(JSON.stringify({
          'message': 'Error: star does not have cordinates or story'
        }));

      } else if (!mempool.verifyAddressRequest(address)) {
        res.status(400).end(JSON.stringify({
          'message': 'Error: request is not verified'
        }));

      } else {
        let storyBuffer = Buffer.from(star.story, "utf8");
        let storyEncoded = storyBuffer.toString("hex");

        const blockBody = {
          "address": address,
          "star": {
              "dec": star.dec,
              "ra": star.ra,
              "story": storyEncoded
          }
        }
        //blockBody.star.story = storyEncoded;
        const block = new Block.Block(blockBody);

        try {
          const newBlock = await myBlockChain.addBlock(block);
          console.log(newBlock);
 
          mempool.removeAddressRequest(address);
          console.log('New block added ');
          //res.status(200).send(newBlock);

          res.json(newBlock);

        } catch (err) {
          console.log('Error posting block ' + err);
          res.status(500).end(JSON.stringify({
            'message': 'Error: could not connect to the server'
          }));
        }
      }
    });
  }

  getBlockEndpoint() {
    var self = this;

    this.app.get('/block/:height', async (req, res) => {
      try {
        let block = await myBlockChain.getBlock(req.params.height);
        block.body.star.storyDecoded = hex2ascii(block.body.star.story);

        //res.status(200).send(JSON.stringify(block));
        res.json(block);

      } catch (err) {
        if (err.notFound) {
          res.status(404).end(JSON.stringify({
            'message': 'Error: block was not found'
          }));
        } else {
          res.status(500).end(JSON.stringify({
            'message': 'Error: could not connect to the server'
          }));
        }
      }
    });
  }

  getStarByAddress() {
    var self = this;

    this.app.get('/stars/address::address', async(req, res) => {
      try {
        let block = await myBlockChain.getBlockByAddress(req.params.address);
        if (block) {

          block.forEach(element => {
            element.body.star.storyDecoded = hex2ascii(element.body.star.story);
          });
        console.log('success');
          //res.status(200).send(JSON.stringify(block));
          res.json(block);

        } else {

          res.status(400).end(JSON.stringify({
            'message': 'Error: could not find block'
          }));
        }
      } catch (err) {

        if (err.notFound) {
          res.status(404).end(JSON.stringify({
            'message': 'Error: could not find block with hash ' + req.params.hash
          }));
        } else {
          res.status(500).end(JSON.stringify({
            'message': 'Error: could not connect to the server'
          }));
        }
      }
    });
  }

  getStarByHash() {
    var self = this;
    this.app.get('/stars/hash::hash', async(req, res) => {

      try {
        let block = await myBlockChain.getBlockByHash(req.params.hash);

        if (block) {

          block.body.star.storyDecoded = hex2ascii(block.body.star.story);
          //res.status(200).send(JSON.stringify(block))
          res.json(block);
        } else {

          res.status(400).end(JSON.stringify({
            'message': 'Error: block was not found '
          }));
        }
      } catch (err) {

        if (err.notFound) {
          res.status(404).end(JSON.stringify({
            'message': 'Error: could not find block with hash ' + req.params.hash
          }));
        } else {
          res.status(500).end(JSON.stringify({
            'message': 'Error: could not connect to server'
          }));
          console.log(err);
        }
      }
    });
  }
}

module.exports = (app) => {
  return new BlockController(app);
}