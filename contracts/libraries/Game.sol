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
        bytes32 ipfsHash;
    }

    function createGame(Game.Info storage self, bytes32 ipfsHash) internal {
        self.state = Game.GameState.CREATED;
        self.ipfsHash = ipfsHash;
    }

    function resolveGame(Game.Info storage self) internal {
        require(self.state == Game.GameState.CREATED, "state must be CREATED");

        self.state = GameState.RESOLVED;
    }
}
