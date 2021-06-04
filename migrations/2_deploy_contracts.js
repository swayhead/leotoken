require('dotenv').config({path: '../.env'})
const LeoToken = artifacts.require('LeoToken');
const MyTokenSale = artifacts.require('MyTokenSale');

module.exports = async deployer=>{
    const addr = await web3.eth.getAccounts();
    await deployer.deploy(LeoToken, process.env.INITIAL_TOKENS);
    await deployer.deploy(MyTokenSale, 1, addr[0], LeoToken.address);
    const instance = await LeoToken.deployed();
    await instance.transfer(MyTokenSale.address, process.env.INITIAL_TOKENS);
}