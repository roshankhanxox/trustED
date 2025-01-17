// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SocialProfileNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    struct ProfileInfo {
        bool exists;
        uint256 tokenId;
        string tokenURI;
    }
    uint256 public nextTokenId = 1;

    // Mappings for profile management
    mapping(address => bool) public hasMinted;
    mapping(address => uint256) public userToTokenId;
    mapping(uint256 => bool) public tokenExists;

    // Events
    event ProfileMinted(address indexed user, uint256 tokenId, string tokenURI);
    event ProfileUpdated(
        address indexed user,
        uint256 tokenId,
        string newTokenURI
    );
    event ProfileTransferred(
        address indexed from,
        address indexed to,
        uint256 tokenId
    );

    // Errors
    error AlreadyMinted();
    error TokenNotFound();
    error NotTokenOwner();
    error InvalidAddress();
    error URIEmpty();
    error TransferNotAllowed();

    constructor(
        address initialOwner
    ) ERC721("Social Profile NFT", "SPNFT") Ownable(initialOwner) {}

    function mintProfileNFT(string calldata tokenURI) external nonReentrant {
        if (hasMinted[msg.sender]) revert AlreadyMinted();
        if (bytes(tokenURI).length == 0) revert URIEmpty();

        uint256 tokenId = nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        hasMinted[msg.sender] = true;
        userToTokenId[msg.sender] = tokenId;
        tokenExists[tokenId] = true;

        emit ProfileMinted(msg.sender, tokenId, tokenURI);
    }

    function updateProfile(string calldata newTokenURI) external nonReentrant {
        if (!hasMinted[msg.sender]) revert TokenNotFound();
        if (bytes(newTokenURI).length == 0) revert URIEmpty();

        uint256 tokenId = userToTokenId[msg.sender];
        if (!tokenExists[tokenId]) revert TokenNotFound();

        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();

        _setTokenURI(tokenId, newTokenURI);

        emit ProfileUpdated(msg.sender, tokenId, newTokenURI);
    }

    function ownerMint(
        address recipient,
        string calldata tokenURI
    ) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert InvalidAddress();
        if (hasMinted[recipient]) revert AlreadyMinted();
        if (bytes(tokenURI).length == 0) revert URIEmpty();

        uint256 tokenId = nextTokenId++;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        hasMinted[recipient] = true;
        userToTokenId[recipient] = tokenId;
        tokenExists[tokenId] = true;

        emit ProfileMinted(recipient, tokenId, tokenURI);
    }

    function getProfileInfo(
        address user
    ) external view returns (ProfileInfo memory) {
        if (!hasMinted[user]) {
            return ProfileInfo({exists: false, tokenId: 0, tokenURI: ""});
        }

        uint256 tokenId = userToTokenId[user];
        return
            ProfileInfo({
                exists: true,
                tokenId: tokenId,
                tokenURI: tokenURI(tokenId)
            });
    }

    function getTokenIdForUser(address user) external view returns (uint256) {
        return userToTokenId[user];
    }

    function exists(uint256 tokenId) external view returns (bool) {
        return tokenExists[tokenId];
    }
}
