// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CredentialNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable
{
    struct Credential {
        bytes32 documentHash;
        address issuer;
        string metadataURI;
    }

    // Renamed the mapping to avoid conflict
    mapping(uint256 => Credential) private _credentialData;
    mapping(address => bool) public authorizedIssuers;
    uint256 private _tokenIdCounter;

    event IssuerStatusChanged(address issuer, bool status);
    event CredentialMinted(uint256 tokenId, address recipient, address issuer);
    event CredentialBurned(uint256 tokenId, address burner);

    constructor(
        address initialOwner
    ) ERC721("CredentialNFT", "CRED") Ownable(initialOwner) {
        authorizedIssuers[initialOwner] = true;
    }

    // Override functions remain the same
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Added the new credentials function that returns individual values
    function credentials(
        uint256 tokenId
    ) external view returns (Credential memory) {
        return _credentialData[tokenId];
    }

    function setIssuerStatus(address issuer, bool status) external onlyOwner {
        authorizedIssuers[issuer] = status;
        emit IssuerStatusChanged(issuer, status);
    }

    function mintCredential(
        address to,
        bytes32 documentHash,
        string memory metadataURI
    ) external returns (uint256) {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        _credentialData[tokenId] = Credential({
            documentHash: documentHash,
            issuer: msg.sender,
            metadataURI: metadataURI
        });

        emit CredentialMinted(tokenId, to, msg.sender);
        return tokenId;
    }

    function getTokensByOwner(
        address owner
    ) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokens;
    }
}
