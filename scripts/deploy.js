const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const initialTokens = process.env.INITIAL_TOKENS || "1000000";

  console.log("Deploying contracts with account:", deployer.address);

  // Deploy LeoToken
  const LeoToken = await hre.ethers.getContractFactory("LeoToken");
  const token = await LeoToken.deploy(initialTokens);
  await token.waitForDeployment();
  console.log("LeoToken deployed to:", await token.getAddress());

  // Deploy KycContract
  const KycContract = await hre.ethers.getContractFactory("KycContract");
  const kyc = await KycContract.deploy();
  await kyc.waitForDeployment();
  console.log("KycContract deployed to:", await kyc.getAddress());

  // Deploy MyTokenSale
  const MyTokenSale = await hre.ethers.getContractFactory("MyTokenSale");
  const tokenSale = await MyTokenSale.deploy(
    1,
    deployer.address,
    await token.getAddress(),
    await kyc.getAddress()
  );
  await tokenSale.waitForDeployment();
  console.log("MyTokenSale deployed to:", await tokenSale.getAddress());

  // Transfer all tokens to sale contract
  await token.transfer(await tokenSale.getAddress(), initialTokens);
  console.log("Transferred", initialTokens, "tokens to MyTokenSale");

  // Export ABIs and addresses for frontend
  await exportForFrontend(hre, {
    LeoToken: await token.getAddress(),
    MyTokenSale: await tokenSale.getAddress(),
    KycContract: await kyc.getAddress(),
  });
}

async function exportForFrontend(hre, addresses) {
  const contractsDir = path.join(__dirname, "../client/src/contracts");
  fs.mkdirSync(contractsDir, { recursive: true });

  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId.toString();

  // Export ABIs
  for (const name of Object.keys(addresses)) {
    const artifact = await hre.artifacts.readArtifact(name);
    fs.writeFileSync(
      path.join(contractsDir, `${name}.json`),
      JSON.stringify({ abi: artifact.abi }, null, 2)
    );
  }

  // Export deployment addresses (merge with existing)
  const deploymentsPath = path.join(contractsDir, "deployments.json");
  let deployments = {};
  if (fs.existsSync(deploymentsPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }
  deployments[chainId] = addresses;
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));

  console.log(`Frontend artifacts exported to ${contractsDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
