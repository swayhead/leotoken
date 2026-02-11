const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LeoToken", function () {
  let token;
  let deployer, recipient;
  const INITIAL_TOKENS = 1000000n;

  beforeEach(async function () {
    [deployer, recipient] = await ethers.getSigners();
    const LeoToken = await ethers.getContractFactory("LeoToken");
    token = await LeoToken.deploy(INITIAL_TOKENS);
  });

  it("Should assign all tokens to the deployer", async function () {
    const totalSupply = await token.totalSupply();
    expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
  });

  it("Should transfer tokens between accounts", async function () {
    await token.transfer(recipient.address, 1);
    expect(await token.balanceOf(recipient.address)).to.equal(1);
  });

  it("Should not allow transferring more than balance", async function () {
    const balance = await token.balanceOf(deployer.address);
    await expect(
      token.transfer(recipient.address, balance + 1n)
    ).to.be.reverted;
  });
});
