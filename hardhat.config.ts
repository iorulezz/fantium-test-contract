import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const ALCHEMY_API_KEY = "ALCHEMY_API_KEY";

const GOERLI_PRIVATE_KEY = "GOERLI_PRIVATE_KEY";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  gasReporter: {
    enabled: false
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY!]
    }
  }
};

export default config;
