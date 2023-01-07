// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract FantiumTest is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _tokenIdCounter;

    string public description;
    mapping(address => bool) private allowlist;
    mapping(uint256 => string) private shares;

    constructor(string memory _description) ERC721("FantiumTest", "FNT") {
        description = _description;
        // Initialize empty shares
        shares[0] = "";
    }

    function safeMint(string memory _share, string memory uri) public {
        require(allowlist[msg.sender], "Caller is not on the allowlist");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        shares[tokenId] = _share;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        // delete from allowlist after minting - should be able to mint only once
        delete allowlist[msg.sender];
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name": "token #',
            tokenId.toString(),
            '",',
            '"description": "',
            description,
            '",',
            '"share": "',
            shares[tokenId],
            '",',
            '"NFTData": "',
            super.tokenURI(tokenId),
            '"',
            "}"
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(dataURI)
                )
            );
    }

    function addAllow(address[] calldata toAddAddresses) external onlyOwner {
        for (uint i = 0; i < toAddAddresses.length; i++) {
            allowlist[toAddAddresses[i]] = true;
        }
    }

    function revokeAllow(
        address[] calldata toRemoveAddresses
    ) external onlyOwner {
        for (uint i = 0; i < toRemoveAddresses.length; i++) {
            delete allowlist[toRemoveAddresses[i]];
        }
    }

    function burn(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
    }

    function isAddressAllowed(address _address) public view returns (bool) {
        return allowlist[_address];
    }

    // Override required by Solidity.
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
