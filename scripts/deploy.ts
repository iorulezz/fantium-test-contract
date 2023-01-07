import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());
  const FntContractFactory = await ethers.getContractFactory("FantiumTest");
  const fntContract = await FntContractFactory.deploy(
    "This token is a share in Happy Gilmore's Earnings for the indicated season."
  );

  await fntContract.deployed();

  console.log(`FantiumTest deployed to ${fntContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
