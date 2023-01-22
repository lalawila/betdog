// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

import "hardhat/console.sol";

library Game {
    uint256 constant multiplier = 1e9;

    enum GameState {
        CREATED,
        RESOLVED,
        CANCELED,
        PAUSED
    }

    struct Info {
        GameState state;
        uint64 startTime;
        uint64 endTime;
        bytes32 ipfsHash;
    }

    function createGame(
        Game.Info storage self,
        uint64 startTime,
        uint64 endTime,
        bytes32 ipfsHash
    ) internal {
        require(endTime > startTime, "end time must be greater than start time");

        self.state = Game.GameState.CREATED;
        self.startTime = startTime;
        self.endTime = endTime;
        self.ipfsHash = ipfsHash;
    }

    function resolveGame(Game.Info storage self) internal {
        require(self.state == Game.GameState.CREATED, "state must be CREATED");
        require(block.timestamp >= self.endTime, "now must be greater than endTime");

        self.state = GameState.RESOLVED;
    }
}
