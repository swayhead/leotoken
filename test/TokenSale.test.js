const Token = artifacts.require("LeoToken");

const chai = require('./setupChai');
const BN = web3.utils.BN;
const expect = chai.expect;

require('dotenv').config();

contract("TokenSale Test", async accounts=>{
    const [deployerAccount, recepient, anotherAccount] = accounts;
    it ('Should not have tokens in my deployer account', async ()=>{
        let instance = await Token.deployed();
        return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN(0))
    });
})