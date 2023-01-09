# Fantium Test Contract

This is a Hardhat project with the purpose of developing a ERC721 compliant smart contract with the following properties:

- It maintains an allowlist that is only editable by the contract owner.
- Addresses in the allowlist can mint exactly 1 token (to mint another they will have to be allowlisted by the owner again).
- It's `tokenURI` method responds with a JSON, Base64 data URL (as defined here [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)). The data content should match:
```javascript
{
    name: "token #<tokenid>",
    description: "Description of the token",
    share: '0.001%',
    NFTData: "ipfs://Qm<hash>",
}
```
    
## Design Choices
The contract was implemented on top of interfaces and contracts from the OpenZeppelin library, as is considered best practice. Our contract implements:

- The `ERC721` contract.
- The `Ownable` contract, to take care of the methods that manipulate the allowlist (so that only the owner can commit such transactions).
- The `ERC721URIStorage` contract. This allows the URIs to be stored (in a mapping). We use this to have a store a different IPFS link for each token (in its NFTData).
- The `ERC721Enumerable` contract. This allows us to call `tokenOfOwnerByIndex` so that we can iterate through all tokens held by a specific address. ***Please note*** that this functionality was not asked by the 
exercise. We added it as an extra so that we can implement the `My Tokens` page in the frontend app that
shows all the tokens that are owned by the connected address.

### Possible improvements
1. Each share is stored as a string. This was done for simplicity in this case. One could consider changing the share to a fixed point number representation with a check that the sum of all shares adhere
to a give threshold. Note that fixed-point arithmetic remains largely an open problem in Solidity. In 
this case, assumming a constant numbner of decimal points (e.g. in our frontend app is 5), we could 
represent this as integers and use OpenZeppelin's `SafeMath` library (which takes cares of overflows).
2. The `NFTData` could be a calculated rather than a stored value. This depends largely on the 
frontend app but it would affect the smart contract. For example, if all JSONs for NFTData where
in the same IPFS folder (note that for this project we are using only free versions of all the relevant tools; ideally, we should be running our own IPFS node for this), then we could query 
IPFS by fixed folder and by `tokenId`. This would lead to saving in gas usage, since there would
be no need to store the URIs in a mapping.
___
## Audit
OpenAI's [ChatGPT](https://chat.openai.com/) was asked to provide an audit for our smart contract.
This is a new AI tool that has generated a lot of traction, in particular in this case for its 
ability to help with Solidity contract audits. Of course, real audits are needed in a 
production environment, but this seems appropriate for the exercise. Here is its response verbatim:

Correctness

    - The safeMint function is correctly checking that the caller is on the allowlist before minting a new token.

    - The tokenURI function is correctly generating a data URI with the metadata of the token.

    - The addAllow and revokeAllow functions are correctly allowing the owner to add and remove addresses from the allowlist.

    - The burn function is correctly allowing the owner to burn a token.

    - The isAddressAllowed function is correctly returning whether an address is on the allowlist or not.

Security

    - The contract is using the OpenZeppelin library for its base contracts, which is a good practice as it has been audited and thoroughly tested.

    - The safeMint function is using the _safeMint function from the ERC721 contract to properly handle the minting of the token, which ensures that the totalSupply and balanceOf variables are correctly updated.

    - The contract is using the Ownable contract from OpenZeppelin, which provides a basic access control mechanism to restrict certain functions to the contract owner. This is good practice as it helps prevent unauthorized changes to the contract state.

    - The delete operator is used in the safeMint function to remove the caller from the allowlist after the token has been minted. This is a good practice as it ensures that the caller can only mint a single token.

Overall, the contract looks well-written and follows best practices for correctness and security.
___
## Testing
Tests in TypeScript can be found in the `test/` folder. Hardhat reports 100% test coverage. You can see the report [here](test/FantiumTest_coverage.txt).
