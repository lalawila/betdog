// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

import "hardhat/console.sol";

library Condition {
    uint256 constant multiplier = 1e9;

    enum ConditionState {
        CREATED,
        RESOLVED,
        CANCELED,
        PAUSED
    }

    struct Info {
        ConditionState state;
        uint256[] reserves;
        uint64 startTime;
        uint64 endTime;
        uint64 outcomeWinIndex;
        uint256 reserve;
        bytes32 ipfsHash;
    }

    function createCondition(
        Condition.Info storage self,
        uint64[] calldata oddsList,
        uint256 reserve,
        uint64 startTime,
        uint64 endTime,
        bytes32 ipfsHash
    ) internal {
        require(endTime > startTime, "end time must be greater than start time");

        uint256 totalOdds = 0;
        for (uint256 i = 0; i < oddsList.length; i++) {
            totalOdds += multiplier ** 2 / oddsList[i];
        }

        // 1e4 is allowed tolerances
        require(totalOdds >= (multiplier - 1e4), "total probabilities must greater than or equal to 1");

        self.state = Condition.ConditionState.CREATED;
        self.reserves = calcReserve(oddsList, reserve);
        self.startTime = startTime;
        self.endTime = endTime;
        self.reserve = reserve;
        self.ipfsHash = ipfsHash;
    }

    function addReserve(Condition.Info storage self, uint64 betIndex, uint256 amount) internal returns (uint256 reward) {
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

    function totalReserves(Condition.Info storage self) internal view returns (uint256 total) {
        for (uint64 i = 0; i < self.reserves.length; i++) {
            total += self.reserves[i];
        }
    }

    function calcReserve(uint64[] calldata oddsList, uint256 totalReserve) internal pure returns (uint256[] memory reserves) {
        reserves = new uint256[](oddsList.length);

        for (uint64 i = 0; i < oddsList.length; i++) {
            reserves[i] = (totalReserve * multiplier) / oddsList[i];
        }
    }

    function resolveCondition(Condition.Info storage self, uint64 outcomeWinIndex) internal {
        require(self.state == Condition.ConditionState.CREATED, "state must be CREATED");

        require(block.timestamp >= self.endTime, "now must be greater than endTime");

        self.state = ConditionState.RESOLVED;
        self.outcomeWinIndex = outcomeWinIndex;
    }
}
