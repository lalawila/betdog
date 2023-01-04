// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.17;

abstract contract OnlyCoreCall {
    error MustBeCoreCall();

    address private immutable _core;

    constructor(address core_) {
        _core = core_;
    }

    modifier onlyCore() {
        if (msg.sender != _core) revert MustBeCoreCall();
        _;
    }
}
