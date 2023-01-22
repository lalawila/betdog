// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

import "hardhat/console.sol";

library Gamble {
    uint256 constant multiplier = 1e9;

    enum GambleState {
        CREATED,
        RESOLVED
    }

    struct Info {
        GambleState state;
        address token;
        uint256 gameId;
        string name;
        uint256 lokedReserve;
        uint256[] reserves;
        string[] outcomes;
        uint32 winner;
    }

    function createGamble(
        Gamble.Info storage self,
        address token,
        uint256 gameId,
        string calldata name,
        uint64[] calldata odds,
        string[] memory outcomes,
        uint256 lokedReserve
    ) internal {
        uint256 totalOdds = 0;
        for (uint256 i = 0; i < odds.length; i++) {
            totalOdds += multiplier ** 2 / odds[i];
        }

        // 1e4 is allowed tolerances
        require(
            totalOdds >= (multiplier - 1e4),
            "sum of probabilities must be greater than or equal to 1"
        );

        self.token = token;
        self.gameId = gameId;
        self.name = name;
        self.outcomes = outcomes;
        self.lokedReserve = lokedReserve;
        self.reserves = calcReserves(odds, lokedReserve);
    }

    function addReserve(
        Gamble.Info storage self,
        uint64 betIndex,
        uint256 amount
    ) internal returns (uint256 reward) {
        uint256 total = totalReserves(self);
        uint256 anothersReserves = total - self.reserves[betIndex];

        uint256 k = self.reserves[betIndex] * anothersReserves;

        self.reserves[betIndex] += amount;

        uint256 afterAnothers = k / self.reserves[betIndex];
        reward = anothersReserves - afterAnothers;

        uint256 ratio = (multiplier * afterAnothers) / anothersReserves;

        for (uint64 i = 0; i < self.reserves.length; i++) {
            if (i != betIndex) {
                self.reserves[i] = (self.reserves[i] * ratio) / multiplier;
            }
        }
    }

    function totalReserves(Gamble.Info storage self) internal view returns (uint256 total) {
        for (uint64 i = 0; i < self.reserves.length; i++) {
            total += self.reserves[i];
        }
    }

    function calcReserves(
        uint64[] calldata odds,
        uint256 totalReserve
    ) internal pure returns (uint256[] memory reserves) {
        reserves = new uint256[](odds.length);

        for (uint64 i = 0; i < odds.length; i++) {
            reserves[i] = (totalReserve * multiplier) / odds[i];
        }
    }

    function resolveGamble(Gamble.Info storage self, uint32 winner) internal {
        require(self.state == GambleState.CREATED, "must be created");

        self.state = GambleState.RESOLVED;
        self.winner = winner;
    }
}
