async function main() {
	const [deployer] = await ethers.getSigners();

	console.log("Deploying contracts with the account:", deployer.address);

	const CredentialNFT = await ethers.getContractFactory("CredentialNFT");
	const CredentialVerifier = await ethers.getContractFactory(
		"CredentialVerifier"
	);

	console.log("deploying credentialNFT");
	const credentialNFT = await CredentialNFT.deploy(deployer.address);
	await credentialNFT.waitForDeployment();
	const credentialNFTAddress = await credentialNFT.getAddress();

	console.log("NFT address:", credentialNFTAddress);

	console.log("deploying credentialNFT");
	const credentialVerifier = await CredentialVerifier.deploy(
		credentialNFTAddress
	);
	await credentialVerifier.waitForDeployment();
	const credentialVerifierAddress = await credentialVerifier.getAddress();
	console.log("verifier address:", credentialVerifierAddress);

	// console.log("Deploying CredentialVerifier...");
	// const credentialVerifier = await CredentialVerifier.deploy(
	// 	"0xdc9fc46553a8d964e3ee60fa6ab6539e57be3284"
	// );
	// await credentialVerifier.waitForDeployment();
	// const credentialVerifierAddress = await credentialVerifier.getAddress();
	// console.log("CredentialVerifier deployed to:", credentialVerifierAddress);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

//rootstock
//NFT address: 0xDC9Fc46553a8d964E3eE60Fa6Ab6539e57be3284
//CredentialVerifier deployed to: 0xe4560f2D41acb8572448cEab5D730DbFABf48906 old one where itried signature verification

// new address 0x7d9623C3aaf945E3d4D4f1Edf6bd6012bbc9B364 nw one using direct address

//sepolia
// deploying credentialNFT
// NFT address: 0x62e491e214F5eAf14c72DC55Da1ED03F70Df0cc3
// Deploying CredentialVerifier...
// CredentialVerifier deployed to: 0xa9255B0D4Ff841B7410a6c78292c4254e6F923Cd

//fuji
// Deploying contracts with the account: 0x11b3a21B7dde163Fc39875fC11Ee2D18428bd417
// deploying credentialNFT
// NFT address: 0xC8956f44abe888C4B21104f2fB81ef3BB4c22675
// deploying credentialNFT
// verifier address: 0x7D0dFC984DFf38bB57d0552Aca7afAc13D7741Df

//token address : 0xBc2E447A5155cD029cFCc5eDD1131D2533ba20B8
