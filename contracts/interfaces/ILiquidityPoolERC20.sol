// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.0;

interface ILiquidityPoolERC20 {
    function token() external returns (address);

    function valueOfLiquidity(uint256 liquidity) external view returns (uint256 value);

    function totalValue() external view returns (uint256 value);

    function lockedValue() external returns (uint256);

    /// @notice Adds liquidity for the given amount
    /// @param amount The amount of liquidity to mint
    function addLiquidity(uint256 amount) external;

    /// @notice Remove liquidity for the given amount
    /// @param amount The amount of liquidity to burn
    function removeLiquidity(uint256 amount) external;

    function pay(address account, uint256 amount) external;

    function lockValue(uint256 value) external;

    function releaseValue(uint256 value) external;
}
