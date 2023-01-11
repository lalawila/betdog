// SPDX-License-Identifier: GPL-2.0-or-later

import "../libraries/Condition.sol";

pragma solidity ^0.8.0;

interface ICore {
    error MustSame();
    error MustBeOracle();

    function lastConditionId() external view returns (uint256);

    function getCondition(uint256 conditionId) external view returns (Condition.Info memory conditionInfo);

    /// @notice Oracle: Create new condition.
    /// @param odds Odds for outcomes such as [4.27, 8.55, 1.42]
    /// @param reserve The amount of reserve will be locked in the pool
    /// @param startTime The start time of betting
    /// @param endTime The end time of betting
    /// @param ipfsHash detailed info about match stored in IPFS
    function createCondition(
        uint64[] calldata odds,
        uint256 reserve,
        uint64 startTime,
        uint64 endTime,
        bytes32 ipfsHash
    ) external returns (uint256 lastConditionId);

    function bet(uint256 conditionId, uint64 outcomeIndex, uint256 amount) external returns (uint256 tokenId);
}
