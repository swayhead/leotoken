const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const contractsDir = path.join(__dirname, "../client/src/contracts");
  fs.mkdirSync(contractsDir, { recursive: true });

  const contractNames = ["LeoToken", "MyTokenSale", "KycContract"];

  for (const name of contractNames) {
    const artifact = await hre.artifacts.readArtifact(name);
    fs.writeFileSync(
      path.join(contractsDir, `${name}.json`),
      JSON.stringify({ abi: artifact.abi }, null, 2)
    );
    console.log(`Exported ${name} ABI`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
