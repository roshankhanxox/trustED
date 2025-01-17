const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VerifySignature", function () {
	it("Check signature", async function () {
		const accounts = await ethers.getSigners(2);

		const VerifySignature = await ethers.getContractFactory(
			"VerifySignature"
		);
		const contract = await VerifySignature.deploy();

		// const PRIV_KEY = "0x..."
		// const signer = new ethers.Wallet(PRIV_KEY)
		const signer = accounts[0];
		const to = accounts[1].address;
		const amount = 999;
		const message = "Hello";
		const nonce = 123;

		const hash = await contract.getMessageHash(to, amount, message, nonce);
		console.log(hash);
		const sig = await signer.signMessage(ethers.utils.arrayify(hash));

		const ethHash = await contract.getEthSignedMessageHash(hash);

		console.log("signer          ", signer.address);
		console.log(
			"recovered signer",
			await contract.recoverSigner(ethHash, sig)
		);

		// Correct signature and message returns true
		expect(
			await contract.verify(
				signer.address,
				to,
				amount,
				message,
				nonce,
				sig
			)
		).to.equal(true);

		// Incorrect message returns false
		expect(
			await contract.verify(
				signer.address,
				to,
				amount + 1,
				message,
				nonce,
				sig
			)
		).to.equal(false);
	});
});

// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("CredentialNFT and CredentialVerifier", function () {
// 	// Declare variables we'll use throughout the tests
// 	let CredentialNFT, CredentialVerifier;
// 	let credentialNFT, credentialVerifier;
// 	let owner, issuer, recipient, unauthorized;
// 	let documentHash, signature, metadataURI;

// 	// Set up fresh contract instances and test data before each test
// 	beforeEach(async function () {
// 		// Get signers for different roles
// 		[owner, issuer, recipient, unauthorized] = await ethers.getSigners();

// 		// Deploy CredentialNFT contract
// 		CredentialNFT = await ethers.getContractFactory("CredentialNFT");
// 		credentialNFT = await CredentialNFT.deploy(owner.address);
// 		await credentialNFT.waitForDeployment();

// 		// Deploy CredentialVerifier contract with NFT contract address
// 		CredentialVerifier = await ethers.getContractFactory(
// 			"CredentialVerifier"
// 		);
// 		credentialVerifier = await CredentialVerifier.deploy(
// 			await credentialNFT.getAddress()
// 		);
// 		await credentialVerifier.waitForDeployment();

// 		// Set up test data
// 		documentHash = ethers.keccak256(ethers.toUtf8Bytes("test document"));
// 		signature = ethers.toUtf8Bytes("test signature"); // In production, use real signatures
// 		metadataURI = "ipfs://test-metadata-uri";
// 	});

// 	describe("CredentialNFT", function () {
// 		describe("Deployment", function () {
// 			it("Should set the right owner", async function () {
// 				expect(await credentialNFT.owner()).to.equal(owner.address);
// 			});

// 			it("Should initialize with correct name and symbol", async function () {
// 				expect(await credentialNFT.name()).to.equal("CredentialNFT");
// 				expect(await credentialNFT.symbol()).to.equal("CRED");
// 			});
// 		});

// 		describe("Issuer Management", function () {
// 			it("Should allow owner to authorize issuer", async function () {
// 				await credentialNFT.setIssuerStatus(issuer.address, true);
// 				expect(await credentialNFT.authorizedIssuers(issuer.address)).to
// 					.be.true;
// 			});

// 			it("Should emit IssuerStatusChanged event", async function () {
// 				await expect(
// 					credentialNFT.setIssuerStatus(issuer.address, true)
// 				)
// 					.to.emit(credentialNFT, "IssuerStatusChanged")
// 					.withArgs(issuer.address, true);
// 			});

// 			it("Should not allow non-owner to authorize issuer", async function () {
// 				await expect(
// 					credentialNFT
// 						.connect(unauthorized)
// 						.setIssuerStatus(issuer.address, true)
// 				).to.be.revertedWithCustomError(
// 					credentialNFT,
// 					"OwnableUnauthorizedAccount"
// 				);
// 			});
// 		});

// 		describe("Credential Minting", function () {
// 			beforeEach(async function () {
// 				// Authorize issuer before each test in this block
// 				await credentialNFT.setIssuerStatus(issuer.address, true);
// 			});

// 			it("Should allow authorized issuer to mint credential", async function () {
// 				await expect(
// 					credentialNFT
// 						.connect(issuer)
// 						.mintCredential(
// 							recipient.address,
// 							documentHash,
// 							signature,
// 							metadataURI
// 						)
// 				).to.emit(credentialNFT, "CredentialMinted");
// 			});

// 			it("Should store and retrieve correct credential data", async function () {
// 				await credentialNFT
// 					.connect(issuer)
// 					.mintCredential(
// 						recipient.address,
// 						documentHash,
// 						signature,
// 						metadataURI
// 					);

// 				const [storedHash, storedSignature, storedIssuer, storedURI] =
// 					await credentialNFT.credentials(0);

// 				expect(storedHash).to.equal(documentHash);
// 				expect(ethers.hexlify(storedSignature)).to.equal(
// 					ethers.hexlify(signature)
// 				);
// 				expect(storedIssuer).to.equal(issuer.address);
// 				expect(storedURI).to.equal(metadataURI);
// 			});

// 			it("Should not allow unauthorized issuer to mint", async function () {
// 				await expect(
// 					credentialNFT
// 						.connect(unauthorized)
// 						.mintCredential(
// 							recipient.address,
// 							documentHash,
// 							signature,
// 							metadataURI
// 						)
// 				).to.be.revertedWith("Not authorized issuer");
// 			});

// 			it("Should increment token ID correctly", async function () {
// 				await credentialNFT
// 					.connect(issuer)
// 					.mintCredential(
// 						recipient.address,
// 						documentHash,
// 						signature,
// 						metadataURI
// 					);

// 				await credentialNFT
// 					.connect(issuer)
// 					.mintCredential(
// 						recipient.address,
// 						documentHash,
// 						signature,
// 						metadataURI
// 					);

// 				const tokens = await credentialNFT.getTokensByOwner(
// 					recipient.address
// 				);
// 				expect(tokens[0]).to.equal(0);
// 				expect(tokens[1]).to.equal(1);
// 			});
// 		});

// 		describe("Token Enumeration", function () {
// 			beforeEach(async function () {
// 				await credentialNFT.setIssuerStatus(issuer.address, true);
// 				// Mint multiple tokens to recipient
// 				await credentialNFT
// 					.connect(issuer)
// 					.mintCredential(
// 						recipient.address,
// 						documentHash,
// 						signature,
// 						metadataURI
// 					);
// 				await credentialNFT
// 					.connect(issuer)
// 					.mintCredential(
// 						recipient.address,
// 						documentHash,
// 						signature,
// 						metadataURI
// 					);
// 			});

// 			it("Should correctly return tokens by owner", async function () {
// 				const tokens = await credentialNFT.getTokensByOwner(
// 					recipient.address
// 				);
// 				expect(tokens.length).to.equal(2);
// 				expect(tokens[0]).to.equal(0);
// 				expect(tokens[1]).to.equal(1);
// 			});

// 			it("Should return correct token balance", async function () {
// 				expect(
// 					await credentialNFT.balanceOf(recipient.address)
// 				).to.equal(2);
// 			});
// 		});
// 	});

// 	describe("CredentialVerifier", function () {
// 		let tokenId;

// 		beforeEach(async function () {
// 			// Create message hash the same way as the contract does
// 			const messageHash = ethers.keccak256(
// 				ethers.AbiCoder.defaultAbiCoder().encode(
// 					["bytes32"],
// 					[documentHash]
// 				)
// 			);

// 			// Sign the message hash
// 			const messageHashBinary = ethers.getBytes(messageHash);
// 			signature = await issuer.signMessage(messageHashBinary);

// 			await credentialNFT.setIssuerStatus(issuer.address, true);
// 			await credentialNFT
// 				.connect(issuer)
// 				.mintCredential(
// 					recipient.address,
// 					documentHash,
// 					signature,
// 					metadataURI
// 				);
// 			tokenId = 0;
// 		});

// 		describe("Verification", function () {
// 			it("Should verify valid credential", async function () {
// 				// Get the credential directly to verify it was stored correctly
// 				const cred = await credentialNFT.credentials(tokenId);
// 				expect(cred.documentHash).to.equal(documentHash);
// 				expect(cred.signature).to.equal(signature);
// 				expect(cred.issuer).to.equal(issuer.address);

// 				// Now verify using the verifier contract
// 				const isValid = await credentialVerifier.verifyCredential(
// 					tokenId,
// 					documentHash,
// 					issuer.address
// 				);
// 				expect(isValid).to.be.true;
// 			});

// 			it("Should reject credential with wrong document hash", async function () {
// 				const wrongHash = ethers.keccak256(
// 					ethers.toUtf8Bytes("wrong document")
// 				);
// 				const isValid = await credentialVerifier.verifyCredential(
// 					tokenId,
// 					wrongHash,
// 					issuer.address
// 				);
// 				expect(isValid).to.be.false;
// 			});

// 			it("Should reject credential with wrong issuer", async function () {
// 				const isValid = await credentialVerifier.verifyCredential(
// 					tokenId,
// 					documentHash,
// 					unauthorized.address
// 				);
// 				expect(isValid).to.be.false;
// 			});

// 			it("Should reject if signature was created by wrong issuer", async function () {
// 				// Create a new signature with the unauthorized account
// 				const messageHash = ethers.keccak256(
// 					ethers.AbiCoder.defaultAbiCoder().encode(
// 						["bytes32"],
// 						[documentHash]
// 					)
// 				);
// 				const messageHashBinary = ethers.getBytes(messageHash);
// 				const wrongSignature = await unauthorized.signMessage(
// 					messageHashBinary
// 				);

// 				// Mint a new credential with the wrong signature
// 				await credentialNFT
// 					.connect(issuer)
// 					.mintCredential(
// 						recipient.address,
// 						documentHash,
// 						wrongSignature,
// 						metadataURI
// 					);
// 				const wrongTokenId = 1;

// 				const isValid = await credentialVerifier.verifyCredential(
// 					wrongTokenId,
// 					documentHash,
// 					issuer.address
// 				);
// 				expect(isValid).to.be.false;
// 			});
// 		});
// 	});
// });
