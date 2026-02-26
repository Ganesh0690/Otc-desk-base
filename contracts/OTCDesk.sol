// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
}

contract OTCDesk {
    uint256 public constant FEE_BPS = 75;
    uint256 public constant BPS_DENOMINATOR = 10000;
    address public owner;
    uint256 public orderCount;
    uint256 public totalVolume;
    uint256 public totalFees;

    struct Order {
        uint256 id;
        address maker;
        address sellToken;
        address buyToken;
        uint256 sellAmount;
        uint256 buyAmount;
        bool active;
        bool filled;
        uint256 createdAt;
        uint256 filledAt;
        address taker;
    }

    mapping(uint256 => Order) public orders;
    uint256[] public activeOrderIds;
    mapping(uint256 => uint256) private activeOrderIndex;

    event OrderCreated(
        uint256 indexed id,
        address indexed maker,
        address sellToken,
        address buyToken,
        uint256 sellAmount,
        uint256 buyAmount,
        uint256 createdAt
    );

    event OrderFilled(
        uint256 indexed id,
        address indexed maker,
        address indexed taker,
        address sellToken,
        address buyToken,
        uint256 sellAmount,
        uint256 buyAmount,
        uint256 fee,
        uint256 filledAt
    );

    event OrderCancelled(uint256 indexed id, address indexed maker, uint256 cancelledAt);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    function createOrder(
        address _sellToken,
        address _buyToken,
        uint256 _sellAmount,
        uint256 _buyAmount
    ) external payable returns (uint256) {
        require(_sellToken != _buyToken, "SAME_TOKEN");
        require(_sellAmount > 0 && _buyAmount > 0, "ZERO_AMOUNT");

        if (_sellToken == address(0)) {
            require(msg.value == _sellAmount, "ETH_MISMATCH");
        } else {
            require(
                IERC20(_sellToken).transferFrom(msg.sender, address(this), _sellAmount),
                "TRANSFER_FAILED"
            );
        }

        uint256 orderId = orderCount++;
        orders[orderId] = Order({
            id: orderId,
            maker: msg.sender,
            sellToken: _sellToken,
            buyToken: _buyToken,
            sellAmount: _sellAmount,
            buyAmount: _buyAmount,
            active: true,
            filled: false,
            createdAt: block.timestamp,
            filledAt: 0,
            taker: address(0)
        });

        activeOrderIndex[orderId] = activeOrderIds.length;
        activeOrderIds.push(orderId);

        emit OrderCreated(orderId, msg.sender, _sellToken, _buyToken, _sellAmount, _buyAmount, block.timestamp);
        return orderId;
    }

    function fillOrder(uint256 _orderId) external payable {
        Order storage order = orders[_orderId];
        require(order.active, "NOT_ACTIVE");
        require(!order.filled, "ALREADY_FILLED");
        require(order.maker != msg.sender, "SELF_FILL");

        uint256 fee = (order.buyAmount * FEE_BPS) / BPS_DENOMINATOR;
        uint256 totalRequired = order.buyAmount + fee;

        if (order.buyToken == address(0)) {
            require(msg.value == totalRequired, "ETH_MISMATCH");
            (bool s1, ) = order.maker.call{value: order.buyAmount}("");
            require(s1, "ETH_TRANSFER_FAILED");
            (bool s2, ) = owner.call{value: fee}("");
            require(s2, "FEE_TRANSFER_FAILED");
        } else {
            require(
                IERC20(order.buyToken).transferFrom(msg.sender, order.maker, order.buyAmount),
                "TRANSFER_TO_MAKER_FAILED"
            );
            if (fee > 0) {
                require(
                    IERC20(order.buyToken).transferFrom(msg.sender, owner, fee),
                    "FEE_TRANSFER_FAILED"
                );
            }
        }

        if (order.sellToken == address(0)) {
            (bool s3, ) = msg.sender.call{value: order.sellAmount}("");
            require(s3, "ETH_TRANSFER_FAILED");
        } else {
            require(
                IERC20(order.sellToken).transfer(msg.sender, order.sellAmount),
                "TRANSFER_TO_TAKER_FAILED"
            );
        }

        order.active = false;
        order.filled = true;
        order.filledAt = block.timestamp;
        order.taker = msg.sender;
        totalVolume += order.sellAmount;
        totalFees += fee;

        _removeActiveOrder(_orderId);

        emit OrderFilled(
            _orderId, order.maker, msg.sender,
            order.sellToken, order.buyToken,
            order.sellAmount, order.buyAmount,
            fee, block.timestamp
        );
    }

    function cancelOrder(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        require(order.active, "NOT_ACTIVE");
        require(order.maker == msg.sender, "NOT_MAKER");

        order.active = false;

        if (order.sellToken == address(0)) {
            (bool success, ) = msg.sender.call{value: order.sellAmount}("");
            require(success, "ETH_REFUND_FAILED");
        } else {
            require(
                IERC20(order.sellToken).transfer(msg.sender, order.sellAmount),
                "REFUND_FAILED"
            );
        }

        _removeActiveOrder(_orderId);
        emit OrderCancelled(_orderId, msg.sender, block.timestamp);
    }

    function getActiveOrders() external view returns (Order[] memory) {
        Order[] memory result = new Order[](activeOrderIds.length);
        for (uint256 i = 0; i < activeOrderIds.length; i++) {
            result[i] = orders[activeOrderIds[i]];
        }
        return result;
    }

    function getActiveOrderCount() external view returns (uint256) {
        return activeOrderIds.length;
    }

    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }

    function getStats() external view returns (uint256 _totalOrders, uint256 _activeOrders, uint256 _totalVolume, uint256 _totalFees) {
        return (orderCount, activeOrderIds.length, totalVolume, totalFees);
    }

    function _removeActiveOrder(uint256 _orderId) internal {
        uint256 index = activeOrderIndex[_orderId];
        uint256 lastIndex = activeOrderIds.length - 1;
        if (index != lastIndex) {
            uint256 lastOrderId = activeOrderIds[lastIndex];
            activeOrderIds[index] = lastOrderId;
            activeOrderIndex[lastOrderId] = index;
        }
        activeOrderIds.pop();
        delete activeOrderIndex[_orderId];
    }

    function withdrawStuckETH() external onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "WITHDRAW_FAILED");
    }

    function withdrawStuckToken(address _token) external onlyOwner {
        uint256 bal = IERC20(_token).balanceOf(address(this));
        require(IERC20(_token).transfer(owner, bal), "WITHDRAW_FAILED");
    }
}
