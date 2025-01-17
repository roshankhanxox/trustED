require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

ROOTSTOCK_TESTNET_PRIVATE_KEY = process.env.ROOTSTOCK_TESTNET_PRIVATE_KEY;
SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
PRIVATE_KEY = process.env.PRIVATE_KEY;
API_KEY = process.env.API_KEY;

//fuji variables
FUJI_RPC_URL = process.env.FUJI_RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: "0.8.28",
	networks: {
		rskTestnet: {
			url: `https://rpc.testnet.rootstock.io/${API_KEY}`,
			chainId: 31,
			gasPrice: 60000000,
			accounts: [ROOTSTOCK_TESTNET_PRIVATE_KEY],
		},
		sepolia: {
			url: SEPOLIA_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 11155111,
		},
		fuji: {
			url: FUJI_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 43113,
		},
	},
};
