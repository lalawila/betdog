// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

abstract contract OnlyCoreCall {
    error MustBeCoreCall();

    address private immutable core;

    constructor(address _core) {
        core = _core;
    }

    modifier onlyCore() {
        if (msg.sender != core) revert MustBeCoreCall();
        _;
    }
}
