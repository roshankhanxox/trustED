async function main() {
	const [deployer] = await ethers.getSigners();

	console.log("Deploying contracts with the account:", deployer.address);

	const SocialProfile = await ethers.getContractFactory("SocialProfileNFT");

	console.log("deploying profile nft");
	const socialProfile = await SocialProfile.deploy(deployer.address);
	await socialProfile.waitForDeployment();
	const socialProfileAddress = await socialProfile.getAddress();
	console.log(`token at ${socialProfileAddress}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
