// For reading the keyboard input

const readline = require('readline-sync');

//---------------------------------------------
// A class representing a vending machine
// @param items - an array of items
// @param prices - the price of each item
//--------------------------------------------

function VendingMachine(items, prices)
{
	// Save the items and prices
	this.items = [...items];
	this.prices = [...prices];

	// How many coins the machine has accepted
	this.sumOfCointsAccepted = 0

	// Displays the menu
	this.showMenu = function()
	{
		console.log("Welcome to our flawless and secure vending experience!");
		// Print Woot twice
		for(let i = 0; i < 2; ++i)
		{
			console.log("Woot!");
		}

		// Prints all the items
		for(let i = 0; i < this.items.length; ++i)
		{
			console.log(i + ". " + this.items[i] +  " [$" + this.prices[i] + "]");
		}
	}

	// ------------------------------------
	// Accepts coins
	// @param item - the requested item
	// @param price - the price of the item
	// --------------------------------------

	this.inputCoins = function(item, price, numItems)
	{
		// The coin sum
		let coinSum = 0.0;
		do
		{
			// Get the money
			let insertedCents = readline.question("\nPlease insert the bills (whole numbers) and/or cents (e.g., .25 to purchase your) to purchase your " +  item.toLowerCase()+  "(" +  coinSum + " inserted so far)\n Enter [r] to return your money. \n Enter [v] to start vending with the current amount. \n Please enter the amount:  ");
			let floatCents = 0;

			// No return requested
			if(insertedCents === "r")
			{
				break;
			}
			
			// Vend with the current funds!
			if(insertedCents === "v")
			{
				break;
			}

			// Looks like money was deposited
			else if(typeof(parseFloat(insertedCents)) === 'number' 
					&& parseFloat(insertedCents) >= 0)
			{
				// Get the floating point value
				floatCents = parseFloat(insertedCents);
				floatCents = Math.trunc(floatCents*100)/100;

				// Add the coin sum
				coinSum += floatCents;
			}else
			{
				console.log("Not a valid input.")
			}

			console.log("Just accepted ", floatCents, " worth of coins\n");

		}while(coinSum < price * numItems);
		// Enough money!
		if(Math.floor(coinSum / price) >= numItems)
		{
			console.log("Please claim you ", numItems, " ", item , "(s).  Also, returning to you the sum of ", coinSum - ((numItems * numItems * price) / numItems));
		}

		// Not enough money
		else
		{
			console.log("Sorry, insufficient funds!");
			this.returnMoney(coinSum);
		}
	}

	// Used to select the item
	this.itemRequest = function()
	{
		// Show the menu
		this.showMenu();
		
		let itemNum = -1;
		while(true)
		{
			// The item number
			itemNum = readline.question("Please enter the item number: ");

			// Check if itemNum is an int between 0 and length of items
			if(itemNum >= 0 && itemNum < items.length && itemNum % 1 === 0)
			{
				console.log("Good choice!");
				break
			}
			else
			{
				console.log("Not a valid choice. Try again.");
			}
		}

		console.log("You selected item: ", itemNum);

		// If this is a bulk purchase, then show the menu
		let numItems = -1
		while(true)
		{
			numItems = readline.question("How many " + this.items[itemNum] + "(s) would you like to purchase? ");

			if(numItems > 0 && numItems % 1 === 0)
			{
				break
			}
			else
			{
				console.log("Not a valid number. Try again.")
			}
		}

		console.log("You requested: ", numItems, " ", this.items[itemNum].toLowerCase(), "(s) which costs " + this.prices[itemNum] * numItems);

		// Go to the purchasing process
		this.inputCoins(this.items[itemNum], this.prices[itemNum], numItems);
	}

	// -----------------------------------------------
	// Will return the money in dollar bills, quarters,
	// dimes, nickles and pennys
	// Returns the coins
	// Returns the money to the user
	// @param amount - the sum of money to return
	// ------------------------------------------------

	this.returnMoney = function(amount)
	{
		// The amount in cents
		let pennyAmount = amount;

		// The amount of bills, quarters, dimes, nickles, and cents to return
		let bills = 0, quarters = 0, dimes = 0, nickles = 0, cents = 0;

		// Do we have more than a dollar bill?
		// If so, then lets convert to cents
		if(amount >= 1)
		{
			pennyAmount = amount * 100;

			// The amount of dollars
			dollars = parseInt(pennyAmount / 100);
	
			// How much money is left over
			pennyAmount = pennyAmount % 100;
		}

		// Let's figure the number of quarters
		quarters = parseInt(pennyAmount / 25);

		// Recompute the remaining amount
		pennyAmount = pennyAmount %  25;

		// Computer the number of dimes
		dimes = parseInt(pennyAmount / 10);

		// Compute the pennies left over
		pennyAmount = pennyAmount % 10;

		// Compute the nickles
		nickles = parseInt(pennyAmount / 5);

		// Compute the pennies left over
		pennyAmount = pennyAmount % 5;

		// The number of cents
		cents = pennyAmount;

		console.log("Returning a sum of ",  (dollars * 100 + quarters * 25 + dimes * 10 + nickles * 5 + cents), " cents");
		console.log(dollars, " dollars");
		console.log(quarters, " quarters");
		console.log(dimes, " dimes");
		console.log(nickles, " nickles");
		console.log(cents, " cents");
	}
}

VendingMachine.prototype.turnOn = function() { this.itemRequest(); }

let vm = new VendingMachine(["Water", "Soda", "Pizza", "Taco", "Tesla"], [.50, .99, 1.99, 3.99, 850000.00]);

vm.turnOn();
