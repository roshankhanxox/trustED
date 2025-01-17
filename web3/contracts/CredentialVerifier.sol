// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICredentialNFT {
    struct Credential {
        bytes32 documentHash;
        address issuer;
        string metadataURI;
    }

    function credentials(
        uint256 tokenId
    ) external view returns (Credential memory);
}

contract CredentialVerifier {
    ICredentialNFT public nftContract;

    constructor(address _nftContract) {
        nftContract = ICredentialNFT(_nftContract);
    }

    function verifyCredential(
        uint256 tokenId,
        bytes32 documentHash,
        address issuer
    ) external view returns (bool) {
        // Get the credential struct from NFT contract
        ICredentialNFT.Credential memory cred = nftContract.credentials(
            tokenId
        );

        // Verify both document hash and issuer address match
        return (cred.documentHash == documentHash && cred.issuer == issuer);
    }
}

// pragma solidity ^0.8.20;

// // Minimal interface for interacting with the CredentialNFT contract
// interface ICredentialNFT {
//     struct Credential {
//         bytes32 documentHash;
//         bytes signature;
//         address issuer;
//         string metadataURI;
//     }

//     function credentials(
//         uint256 tokenId
//     ) external view returns (Credential memory);
// }

// contract CredentialVerifier {
//     ICredentialNFT public nftContract;

//     constructor(address _nftContract) {
//         nftContract = ICredentialNFT(_nftContract);
//     }

//     function verifyCredential(
//         uint256 tokenId,
//         bytes32 documentHash,
//         address issuer
//     ) external view returns (bool) {
//         // Get the entire credential struct
//         ICredentialNFT.Credential memory cred = nftContract.credentials(
//             tokenId
//         );

//         // Verify document hash and issuer
//         return (cred.documentHash == documentHash && cred.issuer == issuer);
//     }
// }
