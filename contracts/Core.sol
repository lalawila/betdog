// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

import "./interfaces/ICore.sol";
import "./interfaces/IBetNFT.sol";
import "./interfaces/ILiquidityPoolERC20.sol";
import "./libraries/Game.sol";
import "./libraries/Gamble.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract Core is Ownable, ICore {
    using SafeERC20 for IERC20;
    using Game for Game.Info;
    using Gamble for Gamble.Info;

    event CreatedGame(uint256 indexed gameId);

    mapping(uint256 => Game.Info) games;
    mapping(uint256 => Gamble.Info) gambles;

    uint256 public override lastGameId;
    uint256 public override lastGambleId;

    address public immutable oracle;

    IBetNFT public betNFT;
    ILiquidityPoolERC20 public pool;

    uint256 constant minReserve = 100 ether;

    uint256 constant multiplier = 1e9;
    uint256 constant fee = 1e7;

    modifier onlyOracle() {
        if (oracle != msg.sender) revert MustBeOracle();
        _;
    }

    constructor(address oracle_) {
        oracle = oracle_;
    }

    function setLP(address lp_) external onlyOwner {
        pool = ILiquidityPoolERC20(lp_);
    }

    function setBet(address bet_) external onlyOwner {
        betNFT = IBetNFT(bet_);
    }

    function getGame(uint256 gameId) external view returns (Game.Info memory gameInfo) {
        return games[gameId];
    }

    /// @inheritdoc ICore
    function createGame(
        uint64 startTime,
        uint64 endTime,
        bytes32 ipfsHash
    ) external override onlyOracle returns (uint256) {
        lastGameId++;

        Game.Info storage gameInfo = games[lastGameId];

        gameInfo.createGame(startTime, endTime, ipfsHash);

        emit CreatedGame(lastGameId);
        return lastGameId;
    }

    function resolveGame(uint256 gameId) external override onlyOracle {
        games[gameId].resolveGame();
    }

    /// @inheritdoc ICore
    function createGamble(
        uint256 gameId,
        string calldata name,
        string[] calldata outcomes,
        uint64[] calldata odds,
        uint256 lokedReserve
    ) external override onlyOracle returns (uint256) {
        require(lokedReserve >= minReserve, "must be at least min reserve");
        pool.lockValue(lokedReserve);

        lastGambleId++;

        Gamble.Info storage gambleInfo = gambles[lastGambleId];

        gambleInfo.createGamble(gameId, name, odds, outcomes, lokedReserve);

        return lastGambleId;
    }

    function resolveGamble(uint256 gambleId, uint32 winner) external override onlyOracle {
        Gamble.Info storage gambleInfo = gambles[gambleId];

        gambleInfo.resolveGamble(winner);
        pool.releaseValue(gambleInfo.lokedReserve);
    }

    function bet(
        uint256 gambleId,
        uint32 betIndex,
        uint256 stake
    ) public override returns (uint256 tokenId) {
        IERC20(pool.token()).safeTransferFrom(msg.sender, address(pool), stake);

        uint256 reward = gambles[gambleId].addReserve(betIndex, stake);

        tokenId = betNFT.mint(msg.sender, gambleId, betIndex, stake, reward);
    }

    function withdraw(uint256 tokenId) external override {
        IBetNFT.Info memory betInfo = betNFT.getBet(tokenId);

        Gamble.Info storage gambleInfo = gambles[betInfo.gambleId];

        require(gambleInfo.state == Gamble.GambleState.RESOLVED, "must be resolved first");

        if (gambleInfo.winner == betInfo.betIndex) {
            // There is a 1% of winer’s rewards will be charge for liquidity income.
            uint256 reward = (betInfo.reward * (multiplier - fee)) / multiplier;
            pool.pay(msg.sender, reward + betInfo.stake);
        }

        betNFT.resolveBet(tokenId);
    }
}
