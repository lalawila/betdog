// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

import "./interfaces/ICore.sol";
import "./interfaces/IBetNFT.sol";
import "./interfaces/ILiquidityPoolERC20.sol";
import "./libraries/Game.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract Core is Ownable, ICore {
    using SafeERC20 for IERC20;
    using Game for Game.Info;

    event CreatedGame(uint256 indexed gameId);

    mapping(uint256 => Game.Info) games;

    address public immutable oracle;

    IBetNFT public betNFT;
    ILiquidityPoolERC20 public pool;

    uint256 public override lastGameId;

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
        uint64[] calldata odds,
        uint256 reserve,
        uint64 startTime,
        uint64 endTime,
        bytes32 ipfsHash
    ) external onlyOracle returns (uint256) {
        require(reserve >= minReserve, "must be at least min reserve");

        pool.lockValue(reserve);

        lastGameId++;

        Game.Info storage gameInfo = games[lastGameId];

        gameInfo.createGame(odds, reserve, startTime, endTime, ipfsHash);

        emit CreatedGame(lastGameId);
        return lastGameId;
    }

    function resolveGame(uint256 gameId, uint64 outcomeWinIndex) external onlyOracle {
        games[gameId].resolveGame(outcomeWinIndex);
        pool.releaseValue(games[gameId].reserve);
    }

    function bet(
        uint256 gameId,
        uint64 betIndex,
        uint256 amount
    ) public override returns (uint256 tokenId) {
        IERC20(pool.token()).safeTransferFrom(msg.sender, address(pool), amount);

        uint256 reward = games[gameId].addReserve(betIndex, amount);

        tokenId = betNFT.mint(msg.sender, gameId, betIndex, amount, reward);
    }

    function resolveBet(uint256 tokenId) external {
        IBetNFT.Info memory betInfo = betNFT.getBet(tokenId);

        Game.Info storage gameInfo = games[betInfo.gameId];

        require(gameInfo.state == Game.GameState.RESOLVED, "must be resolved first");

        if (gameInfo.outcomeWinIndex == betInfo.outcomeIndex) {
            // There is a 1% of winer’s rewards will be charge for liquidity income.
            uint256 reward = (betInfo.reward * (multiplier - fee)) / multiplier;
            pool.pay(msg.sender, reward + betInfo.amount);
        }

        betNFT.resolveBet(tokenId);
    }
}
