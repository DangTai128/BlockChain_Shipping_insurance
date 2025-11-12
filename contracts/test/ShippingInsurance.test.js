const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShippingInsurance", function () {
  let shippingInsurance;
  let owner;
  let user1;
  let oracle;
  
  beforeEach(async function () {
    [owner, user1, oracle] = await ethers.getSigners();
    
    const ShippingInsurance = await ethers.getContractFactory("ShippingInsurance");
    shippingInsurance = await ShippingInsurance.deploy();
    await shippingInsurance.waitForDeployment();
    
    // Set oracle address
    await shippingInsurance.connect(owner).setOracleAddress(oracle.address);
  });
  
  describe("Policy Creation", function () {
    it("Should create a new insurance policy", async function () {
      const shipmentId = "SHIP001";
      const coverageAmount = ethers.parseEther("1.0"); // 1 ETH
      const duration = 7 * 24 * 60 * 60; // 7 days
      const premium = (coverageAmount * 2n) / 100n; // 2% premium
      
      await expect(
        shippingInsurance.connect(user1).createPolicy(shipmentId, coverageAmount, duration, {
          value: premium
        })
      ).to.emit(shippingInsurance, "PolicyCreated")
       .withArgs(1, user1.address, shipmentId, coverageAmount, premium);
      
      const policy = await shippingInsurance.getPolicy(1);
      expect(policy.policyholder).to.equal(user1.address);
      expect(policy.shipmentId).to.equal(shipmentId);
      expect(policy.coverageAmount).to.equal(coverageAmount);
      expect(policy.status).to.equal(0); // Active
    });
    
    it("Should reject duplicate shipment ID", async function () {
      const shipmentId = "SHIP002";
      const coverageAmount = ethers.parseEther("1.0");
      const duration = 7 * 24 * 60 * 60;
      const premium = (coverageAmount * 2n) / 100n;
      
      // Create first policy
      await shippingInsurance.connect(user1).createPolicy(shipmentId, coverageAmount, duration, {
        value: premium
      });
      
      // Try to create second policy with same shipment ID
      await expect(
        shippingInsurance.connect(user1).createPolicy(shipmentId, coverageAmount, duration, {
          value: premium
        })
      ).to.be.revertedWith("Shipment already insured");
    });
  });
  
  describe("Oracle Functions", function () {
    beforeEach(async function () {
      // Create a policy first
      const shipmentId = "SHIP003";
      const coverageAmount = ethers.parseEther("1.0");
      const duration = 7 * 24 * 60 * 60;
      const premium = (coverageAmount * 2n) / 100n;
      
      await shippingInsurance.connect(user1).createPolicy(shipmentId, coverageAmount, duration, {
        value: premium
      });
    });
    
    it("Should allow oracle to update shipment status", async function () {
      const shipmentId = "SHIP003";
      
      await expect(
        shippingInsurance.connect(oracle).updateShipmentStatus(shipmentId, 2) // Damaged
      ).to.emit(shippingInsurance, "ShipmentStatusUpdated");
      
      const policy = await shippingInsurance.getPolicy(1);
      expect(policy.shipmentStatus).to.equal(2); // Damaged
    });
    
    it("Should reject non-oracle address from updating status", async function () {
      const shipmentId = "SHIP003";
      
      await expect(
        shippingInsurance.connect(user1).updateShipmentStatus(shipmentId, 2)
      ).to.be.revertedWith("Only oracle can call this function");
    });
  });
  
  describe("Automatic Claim Processing", function () {
    beforeEach(async function () {
      // Create a policy
      const shipmentId = "SHIP004";
      const coverageAmount = ethers.parseEther("1.0");
      const duration = 7 * 24 * 60 * 60;
      const premium = (coverageAmount * 2n) / 100n;
      
      await shippingInsurance.connect(user1).createPolicy(shipmentId, coverageAmount, duration, {
        value: premium
      });
    });
    
    it("Should automatically process claim when shipment is damaged", async function () {
      const shipmentId = "SHIP004";
      const initialBalance = await ethers.provider.getBalance(user1.address);
      
      // Update status to damaged
      await shippingInsurance.connect(oracle).updateShipmentStatus(shipmentId, 2); // Damaged
      
      const finalBalance = await ethers.provider.getBalance(user1.address);
      const policy = await shippingInsurance.getPolicy(1);
      
      expect(policy.status).to.equal(1); // Claimed
      expect(policy.claimProcessed).to.be.true;
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });
  });
  
  describe("Access Control", function () {
    it("Should allow only owner to set oracle address", async function () {
      await expect(
        shippingInsurance.connect(user1).setOracleAddress(user1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should allow owner to withdraw funds", async function () {
      // First create a policy to add funds
      const shipmentId = "SHIP005";
      const coverageAmount = ethers.parseEther("1.0");
      const duration = 7 * 24 * 60 * 60;
      const premium = (coverageAmount * 2n) / 100n;
      
      await shippingInsurance.connect(user1).createPolicy(shipmentId, coverageAmount, duration, {
        value: premium
      });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await shippingInsurance.connect(owner).withdraw();
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });
  });
});
