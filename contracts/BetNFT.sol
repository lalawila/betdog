// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./interfaces/IBetNFT.sol";
import "./OnlyCoreCall.sol";

import "hardhat/console.sol";

contract BetNFT is ERC721, IBetNFT, OnlyCoreCall {
    event MintedBet(uint256 indexed tokenId);

    mapping(uint256 => IBetNFT.Info) public override bets;

    /// @inheritdoc IBetNFT
    uint256 public override lastTokenId;

    uint64 constant multiplier = 1e9;

    constructor(address _core) ERC721("Bet NFT", "BETNFT") OnlyCoreCall(_core) {}

    function getBet(uint256 tokenId) external view returns (IBetNFT.Info memory) {
        return bets[tokenId];
    }

    function mint(
        address account,
        uint256 gambleId,
        uint32 betIndex,
        uint256 stake,
        uint256 reward
    ) external override onlyCore returns (uint256) {
        lastTokenId++;

        _mint(account, lastTokenId);

        IBetNFT.Info storage betInfo = bets[lastTokenId];
        betInfo.state = BetState.CREATED;
        betInfo.gambleId = gambleId;
        betInfo.betIndex = betIndex;
        betInfo.stake = stake;
        betInfo.reward = reward;

        emit MintedBet(lastTokenId);

        return lastTokenId;
    }

    function resolveBet(uint256 tokenId) external override onlyCore {
        IBetNFT.Info storage betInfo = bets[tokenId];

        require(betInfo.state == BetState.CREATED);

        betInfo.state = BetState.RESOLVED;
    }
}
