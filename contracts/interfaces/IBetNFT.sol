// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.0;

interface IBetNFT {
    enum BetState {
        CREATED,
        RESOLVED
    }

    // info stored for each minted betNFT
    struct Info {
        BetState state;
        uint256 gambleId;
        uint32 betIndex;
        uint256 stake;
        uint256 reward;
    }

    /// @notice Returns the last token id
    /// @return lastTokenId The last token id
    function lastTokenId() external view returns (uint256 lastTokenId);

    function bets(
        uint256 tokenId
    )
        external
        view
        returns (BetState state, uint256 gambleId, uint32 betIndex, uint256 stake, uint256 reward);

    function getBet(uint256 tokenId) external view returns (IBetNFT.Info memory info);

    function mint(
        address account,
        uint256 gambleId,
        uint32 betIndex,
        uint256 stake,
        uint256 reward
    ) external returns (uint256);

    function resolveBet(uint256 tokenId) external;
}
