import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("My Tests of Fantium", function () {
  const DESCRIPTION = "Dominic's returns for 2023";
  async function deployAndAddOneToAllow() {
    // Contracts are deployed using the first signer/account by default
    const [owner, other, otherother] = await ethers.getSigners();

    const FNTT = await ethers.getContractFactory("FantiumTest");
    const fntt = await FNTT.deploy(DESCRIPTION);

    // add other to allowlist
    await fntt.addAllow(Array.of(other.address));
    return { fntt, owner, other, otherother };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { fntt, owner } = await loadFixture(deployAndAddOneToAllow);

      expect(await fntt.owner()).to.equal(owner.address);
    });

    it("Should have the right description", async function () {
      const { fntt } = await loadFixture(deployAndAddOneToAllow);

      expect(await fntt.description()).to.equal(DESCRIPTION);
    });

    it('supports interface', async () => {
      const { fntt } = await loadFixture(deployAndAddOneToAllow);
      
      expect(await fntt.supportsInterface('0x01ffc9a7')).to.be.true;
    });
  });

  describe("Manipulate allowlist", function () {
    it("other is already in the allowlist", async function () {
      const { fntt, other } = await loadFixture(deployAndAddOneToAllow);
      expect(await fntt.isAddressAllowed(other.address)).to.be.true;
    });

    it("cannot add unless owner", async function () {
      const { fntt, other, otherother } = await loadFixture(
        deployAndAddOneToAllow
      );

      await expect(
        fntt.connect(other).addAllow(Array.of(otherother.address))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("cannot revoke unless owner", async function () {
      const { fntt, other, otherother } = await loadFixture(
        deployAndAddOneToAllow
      );

      await expect(
        fntt.connect(other).revokeAllow(Array.of(other.address))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("owner can add", async function () {
      const { fntt, otherother } = await loadFixture(deployAndAddOneToAllow);

      await expect(fntt.addAllow(Array.of(otherother.address))).to.not.be.reverted;

      expect(await fntt.isAddressAllowed(otherother.address)).to.be.true;
    });

    it("owner can revoke", async function () {
      const { fntt, other } = await loadFixture(deployAndAddOneToAllow);

      expect(await fntt.isAddressAllowed(other.address)).to.be.true;

      await expect(fntt.revokeAllow(Array.of(other.address))).to.not.be.reverted;

      expect(await fntt.isAddressAllowed(other.address)).to.be.false;
    });
  });

  describe("Mint", function () {
    it("cannot mint unless you are in allowlist", async function () {
      const { fntt, otherother } = await loadFixture(deployAndAddOneToAllow);

      await expect(
        fntt.connect(otherother).safeMint("0.001", "ipfs://QmTest")
      ).to.be.revertedWith("Caller is not on the allowlist");
    });

    it("can mint if in allowlist", async function () {
      const { fntt, other } = await loadFixture(deployAndAddOneToAllow);

      expect(await fntt.isAddressAllowed(other.address)).to.be.true;

      await expect(fntt.connect(other).safeMint("0.001", "ipfs://QmTest")).not
        .to.be.reverted;
    });

    it("token uri is correct after mint", async function () {
      const { fntt, other } = await loadFixture(deployAndAddOneToAllow);

      await fntt.connect(other).safeMint("0.001", "ipfs://QmTest");
      const tokenURIResponse = await fntt.tokenURI(0);
      const base64EncodedData = tokenURIResponse.split(",")[1];
      const jsonString = Buffer.from(base64EncodedData, "base64").toString();
      const json = JSON.parse(jsonString);
      expect(json["name"]).to.equal("token #0");
      expect(json["description"]).to.equal("Dominic's returns for 2023");
      expect(json["share"]).to.equal("0.001");
      expect(json["NFTData"]).to.equal("ipfs://QmTest");
    });

    it("can only mint one token if in allowlist", async function () {
      const { fntt, other } = await loadFixture(deployAndAddOneToAllow);

      await expect(fntt.connect(other).safeMint("0.001", "ipfs://QmTest")).not
        .to.be.reverted;

      await expect(
        fntt.connect(other).safeMint("0.002", "ipfs://QmTest2")
      ).to.be.revertedWith("Caller is not on the allowlist");
    });
  });

  describe("Burn", function () {
    it("only owner can burn", async function () {
      const { fntt, other } = await loadFixture(deployAndAddOneToAllow);

      await expect(fntt.connect(other).burn(0)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("cannot burn if token does not exist", async function () {
      const { fntt } = await loadFixture(deployAndAddOneToAllow);

      await expect(fntt.burn(0)).to.be.revertedWith("ERC721: invalid token ID");
    });

    it("owner can burn if token has been minted", async function () {
      const { fntt, other } = await loadFixture(deployAndAddOneToAllow);

      await fntt.connect(other).safeMint("0.001", "ipfs://QmTest");
      await expect(fntt.burn(0)).to.not.be.reverted;

      await expect(fntt.tokenURI(0)).to.be.revertedWith("ERC721: invalid token ID");

    });
  });
});
