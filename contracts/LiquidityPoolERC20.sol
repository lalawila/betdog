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

    constructor(address core_, address token_) ERC20("BetDog Token", "BDT") OnlyCoreCall(core_) {
        token = token_;
    }

    function addLiquidity(uint256 value) external override {
        _addLiquidity(value);

        IERC20(token).safeTransferFrom(msg.sender, address(this), value);
    }

    function _addLiquidity(uint256 value) private {
        uint256 currentSupply = totalSupply();

        if (currentSupply == 0) {
            _mint(msg.sender, value);
        } else {
            _mint(msg.sender, (value * currentSupply) / totalTokenValue());
        }
    }

    function removeLiquidity(uint256 value) external override {
        _removeLiquidity(value);

        IERC20(token).safeTransfer(msg.sender, value);
    }

    function _removeLiquidity(uint256 value) private {
        uint256 amount = (value * totalSupply()) / totalTokenValue();

        require(amount <= balanceOf(msg.sender), "balance influences");

        _burn(msg.sender, amount);
    }

    function pay(address account, uint256 amount) external override onlyCore {
        IERC20(token).safeTransfer(account, amount);
    }

    function totalTokenValue() public view returns (uint256 value) {
        value = IERC20(token).balanceOf(address(this));
    }

    function releaseValue(uint256 value) external override onlyCore {
        require(lockedValue >= value, "locked value influences");
        lockedValue -= value;
    }

    function lockValue(uint256 value) external override onlyCore {
        require(lockedValue + value <= totalTokenValue(), "locked value influences");
        lockedValue += value;
    }
}
