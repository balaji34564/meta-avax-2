// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    mapping(string => uint256) private stocks;
    mapping(string => uint256) private stockPrices;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event SetStockPrice(string stockSymbol, uint256 price);
    event TradeStock(string fromSymbol, uint256 fromQuantity, string toSymbol, uint256 toQuantity);
    event HoldStockForLongTerm(string stockSymbol, uint256 quantity);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;
        require(msg.sender == owner, "You are not the owner of this account"); 
        balance += _amount;
        assert(balance == _previousBalance + _amount);
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }  
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount)); 
        emit Withdraw(_withdrawAmount);
    }

    function setStockPrice(string memory _stockSymbol, uint256 _price) public {
        require(msg.sender == owner, "You are not the owner of this account");
        stockPrices[_stockSymbol] = _price;
        emit SetStockPrice(_stockSymbol, _price);
    }

    function tradeStock(
        string memory _fromSymbol,
        uint256 _fromQuantity,
        string memory _toSymbol,
        uint256 _toQuantity
    ) public {
        require(msg.sender == owner, "You are not the owner of this account"); 
        require(stocks[_fromSymbol] >= _fromQuantity, "Insufficient stocks to trade");
        uint256 tradeCost = stockPrices[_fromSymbol] * _fromQuantity;
        require(balance >= tradeCost, "Insufficient funds to cover the trade cost"); 
        stocks[_fromSymbol] -= _fromQuantity;
        stocks[_toSymbol] += _toQuantity;
        balance -= tradeCost;


        emit TradeStock(_fromSymbol, _fromQuantity, _toSymbol, _toQuantity);
    }

    function holdStockForLongTerm(string memory _stockSymbol, uint256 _quantity) public {
        require(msg.sender == owner, "You are not the owner of this account"); 
        require(stocks[_stockSymbol] >= _quantity, "Insufficient stocks for long-term holding");
        emit HoldStockForLongTerm(_stockSymbol, _quantity);
    }
}
