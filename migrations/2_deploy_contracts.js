const LeoToken = artifacts.require('LeoToken');
const MyTokenSale = artifacts.require('MyTokenSale');

module.exports = async deployer=>{
    const addr = await web3.eth.getAccounts();
    const totalSupply = 1000000;
    await deployer.deploy(LeoToken, totalSupply);
    await deployer.deploy(MyTokenSale, 1, addr[0], LeoToken.address);
    const instance = await LeoToken.deployed();
    await instance.transfer(MyTokenSale.address, totalSupply);
}