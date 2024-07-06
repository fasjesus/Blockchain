// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VirtualStore {
    // Structure for Product
    struct Product {
        uint id;
        string name;
        string category;
        uint price;
        uint quantityAvailable;
        string status; // New
    }

    // Structure for Sale
    struct Sale {
        uint id;
        uint productId;
        uint quantity;
        uint price;
        address buyerAddress;
        uint startDate; // New
        uint endDate;   // New
    }

    // Structure for User
    struct User {
        uint id;
        string name;
        string email;
        string username;     // New
        string password;     // New
        uint age;            // New
        address ethereumAddress;
    }

    // State variables for keeping track of IDs
    uint private nextProductId;
    uint private nextSaleId;
    uint private nextUserId;

    // Array of products
    Product[] public products;

    // Array of sales (private)
    Sale[] private sales;

    // Mapping of users by ID
    mapping(uint => User) public users;

    // Event for adding product
    event ProductAdded(uint id, string name, string category, uint price, uint quantityAvailable, string status);

    // Constructor
    constructor() {
        nextProductId = 1;
        nextSaleId = 1;
        nextUserId = 1;
    }

    // Methods for Product
    function addProduct(string memory _name, string memory _category, uint _price, uint _quantityAvailable, string memory _status) public {
        uint productId = nextProductId++;
        products.push(Product(productId, _name, _category, _price, _quantityAvailable, _status));
        emit ProductAdded(productId, _name, _category, _price, _quantityAvailable, _status);
    }

    function getProduct(uint _index) public view returns (uint, string memory, string memory, uint, uint, string memory) {
        require(_index < products.length, "Product index out of bounds");
        Product memory p = products[_index];
        return (p.id, p.name, p.category, p.price, p.quantityAvailable, p.status);
    }

    function getAllProducts() public view returns (Product[] memory) {
        return products;
    }

    function updateProduct(uint _index, string memory _name, string memory _category, uint _price, uint _quantityAvailable, string memory _status) public {
        require(_index < products.length, "Product index out of bounds");
        Product storage p = products[_index];
        p.name = _name;
        p.category = _category;
        p.price = _price;
        p.quantityAvailable = _quantityAvailable;
        p.status = _status;
    }

    function deleteProduct(uint _index) public {
        require(_index < products.length, "Product index out of bounds");
        delete products[_index];
    }

    // Methods for Sale
    function recordSale(uint _productId, uint _quantity, uint _price, address _buyerAddress, uint _startDate, uint _endDate) public {
        uint saleId = nextSaleId++;
        sales.push(Sale(saleId, _productId, _quantity, _price, _buyerAddress, _startDate, _endDate));
    }

    function getSale(uint _index) public view returns (uint, uint, uint, uint, address, uint, uint) {
        require(_index < sales.length, "Sale index out of bounds");
        Sale memory v = sales[_index];
        return (v.id, v.productId, v.quantity, v.price, v.buyerAddress, v.startDate, v.endDate);
    }

    function getAllSales() public view returns (Sale[] memory) {
        return sales;
    }

    // Methods for User
    function registerUser(string memory _name, string memory _email, string memory _username, string memory _password, uint _age, address _ethereumAddress) public {
        uint userId = nextUserId++;
        users[userId] = User(userId, _name, _email, _username, _password, _age, _ethereumAddress);
    }

    function getUser(uint _id) public view returns (string memory, string memory, string memory, string memory, uint, address) {
        User memory u = users[_id];
        return (u.name, u.email, u.username, u.password, u.age, u.ethereumAddress);
    }
    
    function findUser(string memory _name, string memory _password) public view returns (uint, string memory, string memory, string memory, string memory, uint, address) {
        for (uint i = 1; i < nextUserId; i++) {
            User memory u = users[i];
            if (keccak256(abi.encodePacked(u.name)) == keccak256(abi.encodePacked(_name)) && keccak256(abi.encodePacked(u.password)) == keccak256(abi.encodePacked(_password))) {
                return (i, u.name, u.email, u.username, u.password, u.age, u.ethereumAddress);
            }
        }
        revert("User not found");
    }

    function findUserByEmail(string memory _email, string memory _password) public view returns (uint, string memory, string memory, string memory, string memory, uint, address) {
        for (uint i = 1; i < nextUserId; i++) {
            User memory u = users[i];
            if (keccak256(abi.encodePacked(u.email)) == keccak256(abi.encodePacked(_email)) && keccak256(abi.encodePacked(u.password)) == keccak256(abi.encodePacked(_password))) {
                return (i, u.name, u.email, u.username, u.password, u.age, u.ethereumAddress);
            }
        }
        revert("User not found");
    }
    
    function updateUser(uint _id, string memory _name, string memory _email, string memory _username, string memory _password, uint _age, address _ethereumAddress) public {
        User storage u = users[_id];
        u.name = _name;
        u.email = _email;
        u.username = _username;
        u.password = _password;
        u.age = _age;
        u.ethereumAddress = _ethereumAddress;
    }

    function deleteUser(uint _id) public {
        delete users[_id];
    }
}
