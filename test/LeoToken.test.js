const Token = artifacts.require("LeoToken");

const chai = require('./setupChai');
const BN = web3.utils.BN;
const expect = chai.expect;

require('dotenv').config()



contract("TokenTest", async accounts=>{
    const [deployerAccount, recepient, anotherAccount] = accounts;

    beforeEach(async ()=>{
        this.myToken = await Token.new(process.env.INITIAL_TOKENS);
    })

    it("All tokens should be in my account", async ()=>{
        let instance = this.myToken;
        let totalSupply = await instance.totalSupply();
        return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
    });

    it("It is possible to send tokens between accounts", async ()=>{
        const tokensToSend = 1;
        let instance =this.myToken;
        await instance.transfer(recepient, tokensToSend);
        return expect(instance.balanceOf(recepient)).to.eventually.be.a.bignumber.equal(new BN(tokensToSend));
    })

    it("It is not possible to send more tokens than available in total", async ()=>{
        let instance = this.myToken;
        let balanceOfDeployer = await instance.balanceOf(deployerAccount);
        return expect(instance.transfer(recepient, new BN(balanceOfDeployer + 1))).to.eventually.be.rejected;
    })

});