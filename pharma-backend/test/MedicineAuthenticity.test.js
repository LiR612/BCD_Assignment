const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicineAuthenticity Contract", function () {
  let medicineContract;
  let owner; // Account 0 - deployer with DEFAULT_ADMIN_ROLE and ADMIN_ROLE
  let admin; // Will be granted ADMIN_ROLE
  let nonAdmin; // Regular account with no special roles
  let accounts; // All available accounts

  beforeEach(async function () {
    // Get signers (different wallets)
    accounts = await ethers.getSigners();
    [owner, admin, nonAdmin] = accounts;

    // Deploy contract (using owner/Account 0)
    const MedicineAuthenticity = await ethers.getContractFactory(
      "MedicineAuthenticity"
    );
    medicineContract = await MedicineAuthenticity.deploy();
  });

  // New test to check admin status of multiple accounts
  describe("Multiple Account Testing", function () {
    it("Should identify which accounts have admin access", async function () {
      // Get the ADMIN_ROLE bytes32 value
      const ADMIN_ROLE = await medicineContract.ADMIN_ROLE();

      // Test each account to see if it has admin role
      console.log("\nTesting admin access for each account:");
      for (let i = 0; i < 5; i++) {
        // Testing first 5 accounts
        const account = accounts[i];
        const hasAdminRole = await medicineContract.hasRole(
          ADMIN_ROLE,
          account.address
        );
        console.log(
          `Account ${i} (${account.address}): ${
            hasAdminRole ? "IS ADMIN ✓" : "NOT ADMIN ✗"
          }`
        );

        // Only the deployer should have admin access initially
        if (i === 0) {
          expect(hasAdminRole).to.be.true;
        } else {
          expect(hasAdminRole).to.be.false;
        }
      }

      // Grant admin role to second account (accounts[1])
      await medicineContract.connect(owner).addAdmin(accounts[1].address);

      // Check again after adding new admin
      console.log("\nAfter adding second account as admin:");
      for (let i = 0; i < 3; i++) {
        // Just checking first 3 accounts now
        const account = accounts[i];
        const hasAdminRole = await medicineContract.hasRole(
          ADMIN_ROLE,
          account.address
        );
        console.log(
          `Account ${i} (${account.address}): ${
            hasAdminRole ? "IS ADMIN ✓" : "NOT ADMIN ✗"
          }`
        );

        // Now both account 0 and 1 should have admin access
        expect(hasAdminRole).to.equal(i <= 1);
      }
    });

    it("Should let deployer use a different account for deployment", async function () {
      // Deploy contract using a different account (account[2])
      const MedicineAuthenticity = await ethers.getContractFactory(
        "MedicineAuthenticity",
        accounts[2] // This account becomes the deployer
      );
      const newContract = await MedicineAuthenticity.deploy();

      // Check which account is now the admin
      const adminAddresses = await newContract.getAdminAddresses();
      expect(adminAddresses[0]).to.equal(accounts[2].address);
      console.log(
        `\nNew deployer (Account 2): ${accounts[2].address} has admin access`
      );

      // Verify account 0 is NOT admin on this new contract
      const ADMIN_ROLE = await newContract.ADMIN_ROLE();
      const accountZeroIsAdmin = await newContract.hasRole(
        ADMIN_ROLE,
        accounts[0].address
      );
      console.log(
        `Original account 0: ${accounts[0].address} has admin access: ${accountZeroIsAdmin}`
      );
      expect(accountZeroIsAdmin).to.be.false;
    });
  });

  describe("Role-based Access Control", function () {
    it("Should set the deployer as admin", async function () {
      const adminAddresses = await medicineContract.getAdminAddresses();
      expect(adminAddresses.length).to.equal(1);
      expect(adminAddresses[0]).to.equal(owner.address);

      const deployerAddress = await medicineContract.getDeployerAddress();
      expect(deployerAddress).to.equal(owner.address);
    });

    it("Should allow owner to add new admin", async function () {
      await medicineContract.connect(owner).addAdmin(admin.address);
      const adminAddresses = await medicineContract.getAdminAddresses();
      expect(adminAddresses.length).to.equal(2);
      expect(adminAddresses).to.include(admin.address);
    });

    it("Should reject when non-owner tries to add admin", async function () {
      await expect(
        medicineContract.connect(nonAdmin).addAdmin(nonAdmin.address)
      ).to.be.reverted;
    });

    it("Should allow owner to remove admin", async function () {
      // First add admin
      await medicineContract.connect(owner).addAdmin(admin.address);

      // Then remove admin
      await medicineContract.connect(owner).removeAdmin(admin.address);

      // Check admin was removed
      const adminAddresses = await medicineContract.getAdminAddresses();
      expect(adminAddresses.length).to.equal(1);
      expect(adminAddresses).to.not.include(admin.address);
    });
  });

  describe("Product Finalization", function () {
    it("Should reject when non-admin tries to finalize product", async function () {
      await expect(
        medicineContract.connect(nonAdmin).finalizeProduct("PROD1", "HASH1")
      ).to.be.reverted;
    });

    it("Should allow admin to finalize product", async function () {
      // First add admin role to the second account
      await medicineContract.connect(owner).addAdmin(admin.address);

      // Now test that this admin can finalize products
      await medicineContract.connect(admin).finalizeProduct("PROD1", "HASH1");

      const hash = await medicineContract.getProductHash("PROD1");
      expect(hash).to.equal("HASH1");
    });

    it("Should prevent duplicate product finalization", async function () {
      await medicineContract.connect(owner).finalizeProduct("PROD1", "HASH1");

      await expect(
        medicineContract.connect(owner).finalizeProduct("PROD1", "HASH2")
      ).to.be.revertedWith("Product already finalized");
    });

    it("Should reject empty product ID or hash", async function () {
      await expect(
        medicineContract.connect(owner).finalizeProduct("", "HASH1")
      ).to.be.revertedWith("Product ID cannot be empty");

      await expect(
        medicineContract.connect(owner).finalizeProduct("PROD1", "")
      ).to.be.revertedWith("Product hash cannot be empty");
    });
  });

  describe("Product Verification", function () {
    it("Should return correct hash for finalized product", async function () {
      await medicineContract.connect(owner).finalizeProduct("PROD1", "HASH1");
      const hash = await medicineContract.getProductHash("PROD1");
      expect(hash).to.equal("HASH1");
    });

    it("Should revert when querying non-finalized product", async function () {
      await expect(
        medicineContract.getProductHash("NONEXISTENT")
      ).to.be.revertedWith("Product not finalized");
    });

    it("Should allow any address to query product hash", async function () {
      await medicineContract.connect(owner).finalizeProduct("PROD1", "HASH1");

      // Non-admin should be able to verify product
      const hash = await medicineContract
        .connect(nonAdmin)
        .getProductHash("PROD1");
      expect(hash).to.equal("HASH1");
    });
  });

  describe("Admin Management", function () {
    it("Should prevent non-DEFAULT_ADMIN from adding new admins", async function () {
      // Grant ADMIN_ROLE to admin account
      await medicineContract.connect(owner).addAdmin(admin.address);

      // admin has ADMIN_ROLE but not DEFAULT_ADMIN_ROLE, so this should fail
      await expect(medicineContract.connect(admin).addAdmin(nonAdmin.address))
        .to.be.reverted;
    });

    it("Should prevent adding existing admin", async function () {
      await medicineContract.connect(owner).addAdmin(admin.address);

      await expect(
        medicineContract.connect(owner).addAdmin(admin.address)
      ).to.be.revertedWith("Already an admin");
    });

    it("Should prevent removing non-admin", async function () {
      await expect(
        medicineContract.connect(owner).removeAdmin(nonAdmin.address)
      ).to.be.revertedWith("Not an admin");
    });

    it("Should reject invalid addresses", async function () {
      const zeroAddress = "0x0000000000000000000000000000000000000000";

      await expect(
        medicineContract.connect(owner).addAdmin(zeroAddress)
      ).to.be.revertedWith("Invalid address");

      await expect(
        medicineContract.connect(owner).removeAdmin(zeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });
});
