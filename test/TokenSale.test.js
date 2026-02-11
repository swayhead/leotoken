const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenSale", function () {
  let token, tokenSale, kyc;
  let deployer, buyer;
  const INITIAL_TOKENS = 1000000n;

  beforeEach(async function () {
    [deployer, buyer] = await ethers.getSigners();

    const LeoToken = await ethers.getContractFactory("LeoToken");
    token = await LeoToken.deploy(INITIAL_TOKENS);

    const KycContract = await ethers.getContractFactory("KycContract");
    kyc = await KycContract.deploy();

    const MyTokenSale = await ethers.getContractFactory("MyTokenSale");
    tokenSale = await MyTokenSale.deploy(
      1,
      deployer.address,
      await token.getAddress(),
      await kyc.getAddress()
    );

    // Transfer all tokens to the sale contract
    await token.transfer(await tokenSale.getAddress(), INITIAL_TOKENS);
  });

  it("Should not have tokens in deployer account", async function () {
    expect(await token.balanceOf(deployer.address)).to.equal(0);
  });

  it("Should have all tokens in the TokenSale contract", async function () {
    const totalSupply = await token.totalSupply();
    expect(
      await token.balanceOf(await tokenSale.getAddress())
    ).to.equal(totalSupply);
  });

  it("Should allow buying tokens after KYC approval", async function () {
    await kyc.setKycStatus(deployer.address, true);
    await deployer.sendTransaction({
      to: await tokenSale.getAddress(),
      value: 1,
    });
    expect(await token.balanceOf(deployer.address)).to.equal(1);
  });

  it("Should reject buying tokens without KYC approval", async function () {
    await expect(
      buyer.sendTransaction({
        to: await tokenSale.getAddress(),
        value: 1,
      })
    ).to.be.revertedWith("This address is not allowed to buy tokens.");
  });

  it("Should restrict KYC whitelisting to owner only", async function () {
    await expect(
      kyc.connect(buyer).setKycStatus(buyer.address, true)
    ).to.be.revertedWithCustomError(kyc, "OwnableUnauthorizedAccount");
  });
});
