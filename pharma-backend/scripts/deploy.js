// const hre = require("hardhat");

// async function main() {
//   const MedicineAuthenticity = await hre.ethers.getContractFactory("MedicineAuthenticity");
//   const contract = await MedicineAuthenticity.deploy();
//   await contract.waitForDeployment();
//   console.log("Contract deployed to:", await contract.getAddress());
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });


const { ethers } = require("hardhat");

async function main() {
    // Get deployer account (Account #0)
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Get contract factory
    const MedicineAuthenticity = await ethers.getContractFactory("MedicineAuthenticity");

    // Deploy the contract and wait for it to be mined (await the promise directly)
    const contract = await MedicineAuthenticity.deploy();

    await contract.waitForDeployment();

    // The contract address is now available after the await
    console.log("Contract deployed to:", await contract.getAddress());
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
