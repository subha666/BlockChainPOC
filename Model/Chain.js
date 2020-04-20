const Block = require('./Block');

const actions = require('../constants');

const { generateProof, isProofValid } = require('../utils/Proof');

class Blockchain {
    constructor(blocks, io) {
        this.blocks = blocks || [new Block(0, 1, 0, [])];
        this.currentTransaction = [];
        this.nodes = [];
        this.io = io;
    }

    addNode(node) {
        this.nodes.push(node);
    }

    mineBlock(block) {
        this.blocks.push(block);
        console.log('Mined Successfully');
        this.io.emit(actions, END_MINING, this.toArray());
    }

    async newTransaction(transaction) {
        this.currentTransaction.push(transaction);
        if (this.currentTransaction.length === 2) {
            console.info('Starting Mining Bloclk...');
            const previousBlock = this.lastBlock();
            process.env.BREAK = false;
            const block = new Block(previousBlock.getIndex() + 1, previousBlock.hashValue(), previousBlock.getProof(), this.currentTransaction);
            const { proof, dontMine } = await generateProof(previousBlock.getProof());
            block.setProof(proof);
            this.currentTransaction = [];
            if (dontMine !== true) {
                this.mineBlock(block);
            }
        }
    }

    lastBlock() {
        return this.blocks[this.blocks.length - 1];
    }

    getLength() {
        return this.blocks.length;
    }

    checkValidity() {
        const { blocks } = this;
        let previousBlock = blocks[0];
        for (let index = 1; index < blocks.length; index++) {
            const currentBlock = blocks[index];
            if (currentBlock.getPreviousBlockHash() !== previousBlock.hashValue()) {
                return false;
            }
            if (!isProofValid(previousBlock.getProof(), currentBlock.getProof())) {
                return false;
            }
            previousBlock = currentBlock;
        }
        return true;
    }
}

module.exports = Blockchain;