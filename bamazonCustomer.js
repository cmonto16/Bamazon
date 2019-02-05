var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "BgoqGxsY",
  database: "bamazon"
});

// function which prompts the user for what action they should take
function start() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;

    var choices = "\n";
    for (var i = 0; i < results.length; i++) {
      var product = results[i];
      choices +=
        "Product ID: " +
        product.item_id +
        " Name: " +
        product.product_name +
        " Department: " +
        product.department_name +
        " Price: " +
        product.price +
        " Quantity Available: " +
        product.stock_quantity +
        "\n";
    }

    inquirer
      .prompt([
        {
          type: "input",
          name: "product",
          message:
            choices + "Input the ID of the product you would like to purchase:",
          filter: function(val) {
            return parseInt(val);
          },
          validate: function(val) {
            for (var i = 0; i < results.length; i++) {
              if (results[i].item_id === val) {
                return true;
              }
            }

            return "Please enter a valid product ID.";
          }
        },
        {
          type: "input",
          name: "quantity",
          message: "How many would you like?",
          filter: function(val) {
            return parseInt(val);
          },
          validate: function(val) {
            if (!val || val <= 0) {
              return "Please enter a number greater than 0.";
            }
            return true;
          }
        }
      ])
      .then(answers => {
        verifyOrder(answers, results);
      });
  });
}

function verifyOrder(answers, availableProducts) {
  console.log("Processing order: " + JSON.stringify(answers, null, "    "));
  var productId = answers.product;
  var requestedQuantity = answers.quantity;
  for (var i = 0; i < availableProducts.length; i++) {
    if (
      availableProducts[i].item_id === productId &&
      availableProducts[i].stock_quantity >= requestedQuantity
    ) {
      var newQuantity = availableProducts[i].stock_quantity - requestedQuantity;
      var totalPurchasePrice = availableProducts[i].price * requestedQuantity;
      processOrder(productId, newQuantity, totalPurchasePrice);
      return;
    }
  }
  console.log("Insufficient quantity! Please try another order.");
  setTimeout(function() {
    start();
  }, 4000);
}

function processOrder(productId, newQuantity, totalPurchasePrice) {
  connection.query(
    "UPDATE products SET stock_quantity='" +
      newQuantity +
      "' where item_id='" +
      productId +
      "'",
    function(error, results) {
      if (error) throw error;
      console.log(
        "\n\nTransaction was successful. Your total cost was " +
          totalPurchasePrice +
          ". Thank you for your business.\n\n"
      );
      setTimeout(function() {
        start();
      }, 4000);
    }
  );
}

start();
