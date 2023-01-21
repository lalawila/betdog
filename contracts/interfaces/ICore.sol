// SPDX-License-Identifier: GPL-2.0-or-later

import "../libraries/Game.sol";

pragma solidity ^0.8.0;

interface ICore {
    error MustSame();
    error MustBeOracle();

    function lastGameId() external view returns (uint256);

    function getGame(uint256 gameId) external view returns (Game.Info memory gameInfo);

    /// @notice Oracle: Create new game.
    /// @param odds Odds for outcomes such as [4.27, 8.55, 1.42]
    /// @param reserve The amount of reserve will be locked in the pool
    /// @param startTime The start time of betting
    /// @param endTime The end time of betting
    /// @param ipfsHash detailed info about match stored in IPFS
    function createGame(
        uint64[] calldata odds,
        uint256 reserve,
        uint64 startTime,
        uint64 endTime,
        bytes32 ipfsHash
    ) external returns (uint256 lastGameId);

    function bet(
        uint256 gameId,
        uint64 outcomeIndex,
        uint256 amount
    ) external returns (uint256 tokenId);
}
