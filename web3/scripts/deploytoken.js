async function main() {
	const [deployer] = await ethers.getSigners();

	console.log("Deploying contracts with the account:", deployer.address);

	const TrustedToken = await ethers.getContractFactory("TrustedToken");

	console.log("deploying token");
	const trustedToken = await TrustedToken.deploy(deployer.address);
	await trustedToken.waitForDeployment();
	const trustedTokenAddress = await trustedToken.getAddress();
	console.log(`token at ${trustedTokenAddress}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
