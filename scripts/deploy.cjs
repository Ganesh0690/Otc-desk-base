const hre = require("hardhat");

async function main() {
  const OTCDesk = await hre.ethers.getContractFactory("OTCDesk");
  const otcDesk = await OTCDesk.deploy();
  await otcDesk.waitForDeployment();
  const address = await otcDesk.getAddress();
  console.log(`OTCDesk deployed to: ${address}`);
  console.log("Waiting for block confirmations...");
  await otcDesk.deploymentTransaction().wait(5);
  console.log("Verifying on BaseScan...");
  try {
    await hre.run("verify:verify", { address, constructorArguments: [] });
    console.log("Contract verified!");
  } catch (e) {
    console.log("Verification failed:", e.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
