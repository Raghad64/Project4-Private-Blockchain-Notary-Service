/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise((resolve, reject) => {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.get(key , (err, value) => {
                //Modified here **
                if (!err){
                    resolve(value);
                }
                reject(err);
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise((resolve, reject) => {
            // Add your code here, remember in Promises you need to resolve() or reject() 
            self.db.put(key, value, (err) => {
                if (err){
                    
                    console.log('Failed adding block ' + key);
                reject(err)
                }
                console.log('Block added ' + key);
                    //Mod here **
                    resolve(value);
            });
        });
    }

    async getBlockByHash(hash) {
        let self = this;
        let block = null;
        return new Promise((resolve, reject) => {
          
          self.db.createReadStream()
          .on('data', (data) => {
            let value = JSON.parse(data.value);
            if (value.hash === hash) {
            //block = value;
            block = data.value;
            }
          })
          .on('error', (err) => {
            reject(err);
          })
          .on('close', () => {
            resolve(block);
          });
        });
        }

    async getBlockByAddress(address) {
        let self = this;
        return new Promise((resolve, reject) => {
          let blocks = [];
          
          self.db.createReadStream()
          .on('data', (data) => {
            const value = JSON.parse(data.value);
            if (value.body.address === address) {
            blocks.push(value);
            }
          })
          .on('error', (err) => {
            reject(err);
          })
          .on('close', () => {
            resolve(blocks);
          });
        });
        }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        return new Promise((resolve, reject) => {
            // Add your code here, remember in Promises you need to resolve() or reject()
            let i = -1;
            self.db.createReadStream()
            .on('data', (data) => {
                i++;
            })
            .on('error', (err) => {
                reject(err);
            })
            .on('close', () => {
                resolve(i);
                
            });
        });
    }
        

}

module.exports.LevelSandbox = LevelSandbox;
