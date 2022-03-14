// SPDX-License-Identifier: MIT


pragma solidity 0.8.12;

contract Escrow {
    address public buyer;
    address payable public seller ;
    address public arbiter;
    uint public amount;

    constructor (address _buyer, address payable _seller, uint _amount)  {
        buyer = _buyer;
        seller = _seller;
        arbiter = msg.sender;
        amount = _amount;
    }
    function deposit() public payable {
        // The send has to be able to send money
        require(msg.sender == buyer, "Sender must be the buyer");
        require(address(this).balance <= amount, "Cant send more than escrow amount");
    }
    function release() public {
        //  All funds need to be received before it can be released
        require(address(this).balance == amount, "cannot release money before the full amount was sent");
        require(msg.sender == arbiter, "Only arbiter can release funds");
        seller.transfer(address(this).balance);
    }
    function balanceOf() public view returns(uint) {
        return address(this).balance;
    }
}