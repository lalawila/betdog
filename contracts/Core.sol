// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

import "./interfaces/ICore.sol";
import "./interfaces/IBetNFT.sol";
import "./interfaces/ILiquidityPoolERC20.sol";
import "./libraries/Condition.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract Core is Ownable, ICore {
    using SafeERC20 for IERC20;
    using Condition for Condition.Info;

    event CreatedCondition(uint256 indexed conditionId);

    mapping(uint256 => Condition.Info) conditions;

    address public immutable oracle;

    IBetNFT public betNFT;
    ILiquidityPoolERC20 public pool;

    uint256 public override lastConditionId;

    uint256 constant minReserve = 100 ether;

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

    function getCondition(uint256 conditionId) external view returns (Condition.Info memory conditionInfo) {
        return conditions[conditionId];
    }

    /// @inheritdoc ICore
    function createCondition(
        uint64[] calldata oddsList,
        uint256 reserve,
        uint64 startTime,
        uint64 endTime,
        bytes32 ipfsHash
    ) external onlyOracle returns (uint256) {
        require(reserve >= minReserve, "must be at least min reserve");

        pool.lockValue(reserve);

        lastConditionId++;

        Condition.Info storage conditionInfo = conditions[lastConditionId];

        conditionInfo.createCondition(oddsList, reserve, startTime, endTime, ipfsHash);

        emit CreatedCondition(lastConditionId);
        return lastConditionId;
    }

    function resolveCondition(uint256 conditionId, uint64 outcomeWinIndex) external onlyOracle {
        conditions[conditionId].resolveCondition(outcomeWinIndex);
        pool.releaseValue(conditions[conditionId].reserve);
    }

    function bet(uint256 conditionId, uint64 betIndex, uint256 amount) public override returns (uint256 tokenId) {
        IERC20(pool.token()).safeTransferFrom(msg.sender, address(pool), amount);

        uint256 reward = conditions[conditionId].addReserve(betIndex, amount);

        tokenId = betNFT.mint(msg.sender, conditionId, betIndex, amount, reward);
    }

    function resolveBet(uint256 tokenId) external {
        IBetNFT.Info memory betInfo = betNFT.getBet(tokenId);

        Condition.Info storage conditionInfo = conditions[betInfo.conditionId];

        require(conditionInfo.state == Condition.ConditionState.RESOLVED, "must be resolved first");

        if (conditionInfo.outcomeWinIndex == betInfo.outcomeIndex) {
            pool.pay(msg.sender, betInfo.reward + betInfo.amount);
        }

        betNFT.resolveBet(tokenId);
    }
}
