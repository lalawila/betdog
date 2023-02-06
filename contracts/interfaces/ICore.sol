// SPDX-License-Identifier: GPL-2.0-or-later

import "./ILiquidityPoolERC20.sol";
import "./IBetNFT.sol";

import "../libraries/Game.sol";

pragma solidity ^0.8.0;

interface ICore {
    error MustSame();
    error MustBeOracle();

    function oracle() external view returns (address);

    function betNFT() external view returns (IBetNFT);

    function pools(address token) external view returns (ILiquidityPoolERC20);

    function lastGameId() external view returns (uint256);

    function lastGambleId() external view returns (uint256);

    function createLp(address token) external;

    // function createBet() external;

    function getGame(uint256 gameId) external view returns (Game.Info memory gameInfo);

    /// @notice Oracle: Create new game.
    /// @param ipfsHash detailed info about match stored in IPFS
    function createGame(bytes32 ipfsHash) external returns (uint256 lastGameId);

    function resolveGame(uint256 gameId) external;

    /// @param odds Odds for outcomes such as [4.27, 8.55, 1.42]
    /// @param lokedReserve The amount of reserve will be locked in the pool
    function createGamble(
        address token,
        uint256 gameId,
        string calldata name,
        string[] calldata outcomes,
        uint64[] calldata odds,
        uint256 lokedReserve
    ) external returns (uint256 gambleId);

    function resolveGamble(uint256 gambleId, uint32 winner) external;

    function bet(
        uint256 gambleId,
        uint32 betIndex,
        uint256 stake
    ) external returns (uint256 tokenId);

    function withdraw(uint256 tokenId) external;
}
