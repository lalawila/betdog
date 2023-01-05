// SPDX-License-Identifier: GPL-2.0-or-later

import "../libraries/Condition.sol";

pragma solidity ^0.8.0;

interface ICore {
    error MustSame();
    error MustBeOracle();

    function lastConditionId() external view returns (uint256);

    function getCondition(uint256 conditionId) external view returns (Condition.Info memory conditionInfo);

    function bet(uint256 conditionId, uint64 outcomeIndex, uint256 amount) external returns (uint256 tokenId);
}
