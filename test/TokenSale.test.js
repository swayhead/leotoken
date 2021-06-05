const Token = artifacts.require("LeoToken");
const TokenSale = artifacts.require("MyTokenSale");
const Kyc = artifacts.require("KycContract");

const chai = require('./setupChai');
const BN = web3.utils.BN;
const expect = chai.expect;

require('dotenv').config();

contract("TokenSale Test", async accounts=>{
    const [deployerAccount, recepient, anotherAccount] = accounts;   
    
    it ('Should not have tokens in my deployer account', async ()=>{
        const tokenInstance = await Token.deployed();
        return expect(tokenInstance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN(0));
    });
    
    it ('All tokens should be in the TokenSale contract by default', async ()=>{
        const tokenInstance = await Token.deployed();
        let balanceOfTokenSale = await tokenInstance.balanceOf(TokenSale.address);
        let totalSupply = await tokenInstance.totalSupply();
        return expect(balanceOfTokenSale).to.be.a.bignumber.equal(totalSupply);
    });

    it ('It should be possible to buy tokens', async ()=>{
        const tokenInstance = await Token.deployed();
        const tokenSaleInstance = await TokenSale.deployed();
        const kycInstance = await Kyc.deployed();
        let balanceBefore = await tokenInstance.balanceOf(deployerAccount);
        await kycInstance.setKycStatus(deployerAccount, true);
        expect(tokenSaleInstance.sendTransaction({from: deployerAccount, value: web3.utils.toWei("1", "wei")})).to.be.fulfilled;
        return expect(tokenInstance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(balanceBefore.add(new BN(1)));
    });

})