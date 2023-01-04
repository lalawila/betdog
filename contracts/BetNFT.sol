// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./interfaces/IBetNFT.sol";
import "./OnlyCoreCall.sol";

import "hardhat/console.sol";

contract BetNFT is ERC721, IBetNFT, OnlyCoreCall {
    event MintedBet(uint256 indexed tokenId);

    mapping(uint256 => IBetNFT.Info) public override bets;

    // Last minted token ID
    uint256 public override lastTokenId;
    uint64 constant multiplier = 1e9;

    constructor(address core_) ERC721("Bet NFT", "BETNFT") OnlyCoreCall(core_) {}

    function getBet(uint256 tokenId) external view returns (IBetNFT.Info memory) {
        return bets[tokenId];
    }

    function mint(
        address account,
        uint256 conditionId,
        uint256 outcomeIndex,
        uint256 amount,
        uint256 reward
    ) external override onlyCore returns (uint256) {
        lastTokenId++;

        _mint(account, lastTokenId);

        IBetNFT.Info storage betInfo = bets[lastTokenId];
        betInfo.state = BetState.CREATED;
        betInfo.conditionId = conditionId;
        betInfo.outcomeIndex = outcomeIndex;
        betInfo.amount = amount;
        betInfo.reward = reward;

        emit MintedBet(lastTokenId);

        return lastTokenId;
    }

    function resolveBet(uint256 tokenId) external override onlyCore {
        IBetNFT.Info storage bet = bets[tokenId];

        require(bet.state == BetState.CREATED);

        bet.state = BetState.RESOLVED;
    }
}
