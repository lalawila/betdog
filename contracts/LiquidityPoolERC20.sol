// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/ILiquidityPoolERC20.sol";
import "./OnlyCoreCall.sol";

import "hardhat/console.sol";

contract LiquidityPoolERC20 is ILiquidityPoolERC20, ERC20, OnlyCoreCall {
    using SafeERC20 for IERC20;

    address public immutable override token;
    uint256 public override lockedValue;

    constructor(
        address _core,
        address _token
    ) ERC20("BetDog Pool Token", "BDPT") OnlyCoreCall(_core) {
        token = _token;
    }

    /// @inheritdoc ILiquidityPoolERC20
    function addLiquidity(uint256 amount) external override {
        uint256 value = _addLiquidity(amount);

        IERC20(token).safeTransferFrom(msg.sender, address(this), value);
    }

    function _addLiquidity(uint256 amount) private returns (uint256 value) {
        uint256 currentSupply = totalSupply();

        if (currentSupply == 0) {
            value = amount;
        } else {
            value = (amount * totalValue()) / currentSupply;
        }

        _mint(msg.sender, amount);
    }

    /// @inheritdoc ILiquidityPoolERC20
    function removeLiquidity(uint256 amount) external override {
        uint256 value = _removeLiquidity(amount);

        IERC20(token).safeTransfer(msg.sender, value);
    }

    function _removeLiquidity(uint256 amount) private returns (uint256 value) {
        require(amount <= balanceOf(msg.sender), "liquidity influences");

        value = (amount * totalValue()) / totalSupply();

        _burn(msg.sender, amount);
    }

    function pay(address account, uint256 amount) external override onlyCore {
        IERC20(token).safeTransfer(account, amount);
    }

    function totalValue() public view override returns (uint256 value) {
        value = IERC20(token).balanceOf(address(this));
    }

    function valueOfLiquidity(uint256 liquidity) external view override returns (uint256 value) {
        value = (IERC20(token).balanceOf(address(this)) * liquidity) / totalSupply();
    }

    function releaseValue(uint256 value) external override onlyCore {
        require(lockedValue >= value, "locked value influences");
        lockedValue -= value;
    }

    function lockValue(uint256 value) external override onlyCore {
        require(lockedValue + value <= totalValue(), "locked value influences");
        lockedValue += value;
    }
}
