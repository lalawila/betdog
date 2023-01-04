// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.0;

interface IBetNFT {
    enum BetState {
        CREATED,
        RESOLVED
    }

    struct Info {
        BetState state;
        uint256 conditionId;
        uint256 outcomeIndex;
        uint256 odds;
        uint256 amount;
        uint256 reward;
    }

    function lastTokenId() external view returns (uint256);

    function bets(
        uint256 tokenId
    )
        external
        view
        returns (
            BetState state,
            uint256 conditionId,
            uint256 outcomeIndex,
            uint256 odds,
            uint256 amount,
            uint256 reward
        );

    function getBet(uint256 tokenId) external view returns (IBetNFT.Info memory info);

    function mint(
        address account,
        uint256 conditionId,
        uint256 outcomeIndex,
        uint256 amount,
        uint256 reward
    ) external returns (uint256);

    function resolveBet(uint256 tokenId) external;
}
