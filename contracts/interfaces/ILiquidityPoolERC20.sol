// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.0;

interface ILiquidityPoolERC20 {
    function token() external returns (address);

    function valueOfLiquidity(uint256 liquidity) external view returns (uint256 value);

    function totalValue() external view returns (uint256 value);

    function lockedValue() external returns (uint256);

    function addLiquidity(uint256 liquidity) external;

    function removeLiquidity(uint256 liquidity) external;

    function pay(address account, uint256 amount) external;

    function lockValue(uint256 value) external;

    function releaseValue(uint256 value) external;
}
