require('dotenv').config({path: '../.env'})
const LeoToken = artifacts.require('LeoToken');
const MyTokenSale = artifacts.require('MyTokenSale');
const MyKycContract = artifacts.require('KycContract');

module.exports = async deployer=>{
    const addr = await web3.eth.getAccounts();
    await deployer.deploy(LeoToken);
    await deployer.deploy(MyKycContract);
    await deployer.deploy(MyTokenSale, 1, addr[0], LeoToken.address, MyKycContract.address);
    const instance = await LeoToken.deployed();
    await instance.addMinter(MyTokenSale.address);
}