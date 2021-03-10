// For keyboard input
const readline = require('readline-sync');

// -----------------------------------------------
// Clear the screen
// -----------------------------------------------
function clearScreen()		//changed screeen to screen
{
	// Clear the screen
	console.log('\033[2J');
}

// ------------------------------------------------
// The constructor for the Account class
// @param acctName - the account name
// @param acctBalance - the amount
// @param type - the type of account
// ------------------------------------------------
function Account(acctName, acctBalance, type)
{
	// The account name
	this.acctName = acctName;
	
	// The account amount
	this.acctBalance = acctBalance;
		
	// The 1 percent interest rate - because our bank is the best!	
	this.interestRate = 1;

	// The account type
	this.type = type;
}																											//moved curly brackets before prototypes

	// Returns the account name
	Account.prototype.getAcctName = function() { return this.acctName; }									//changed to protype
	
	// Returns the account balance
	Account.prototype.getBalance = function() { return this.acctBalance; }									//changed to protype
	
	// Returns the account type
	Account.prototype.getAccountType = function() { return this.type; }										//changed to protype
	
	// Deposits money to the account
	// @param amount - the amount to deposit
	Account.prototype.deposit = function(amount) { 
		let totalBalance = parseFloat(this.acctBalance) +  parseFloat(amount)								// created variable totalBalance to return 2 decimal places only
		this.acctBalance  = Math.trunc(totalBalance * 100) / 100; 											//changed to protype / trunc'd the total / changed to float
	}
	
	// Withdraws money from the account
	// @param amount - the amount to withdraw
	Account.prototype.withdraw = function(amount) 
	{
		let newBalance = this.acctBalance 																	// created a variable for this.acctBalance
		if(amount <= newBalance) 
		{
			let totalBalance = parseFloat(this.acctBalance) - parseFloat(amount);							// created variable totalBalance to return 2 decimal places only
			this.acctBalance = Math.trunc(totalBalance * 100) / 100;										//changed to protype / trunc'd the total / changed to float
		}
		else 
		{
			console.log("\n **Insufficient Funds**\n");
		}
	}
	// Prints the account information
	Account.prototype.printAcct = function()																//changed to protype
	{
		console.log("Account name: ", this.getAcctName());
		console.log("Account type: ", this.getAccountType());
		console.log("Account balance: ", this.getBalance(), "\n");
	}

// ------------------------------------------------
// The constructor for the customer class
// @param userName - the user name
// @param userPassword - the user password
// ------------------------------------------------
function Customer(userName, userPassword)
{
	// Save the user name and password
	this.userName = userName;
	this.userPassword = userPassword;
	
	// The list of accounts	
	this.accounts = []														//moved this.accounts above prototype inside Customer() function
}
	
	// Returns the username
	Customer.prototype.getUserName = function() { return this.userName; }
	
	// Returns the password
	Customer.prototype.getPassword = function() { return this.userPassword; }
	
	// Returns the accounts
	Customer.prototype.getAccounts = function() { return this.accounts; }
	
	// Add account
	// @param account - the account
	Customer.prototype.addAccount = function(account) { this.accounts.push(account); }
	
	// Returns the account based on the account index
	// @param acctIndex - the account index
	// @return - the account based on the index	
	Customer.prototype.getAccount = function(acctIndex) { return this.accounts[acctIndex]; }

// ----------------------------------------------
// The constructor of the Bank class
// @param name - the name of the bank 
// @param initCustomerList - the initial customer list
// ----------------------------------------------
function Bank(name, initCustomerList)
{
	// Save the bank name
	this.name = name;

	// The object that acts like a map representing the bank customers.
	// The key is the customer user name. The value is the Customer object
	// containing the customer information
	this.customers = {};
	
	// The welcome banner ad!
	for(let i = 0; i < 3; i++)											// changed var to let
	{
		console.log("Welcome to ", name, "!\n");
	}
		
	// Initialize the customer map
	let i = 0;															// initialized let i = 0
	while(i < initCustomerList.length)													
	{
		// Get the customer
		customer = initCustomerList[i];

		this.customers[customer.getUserName()] = customer;
		
		// Next user!	
		i += 1;	
	}
}																		//moved curly bracket above prototypes
	
	// -------------------------------------------------------------
	// Creates a new user with the specified user name and password.
	// Returns a user object specifying the new user
	// @param userName - the name of the user
	// @param userPassword - the user password
	// The newly created user.
	// -------------------------------------------------------------
	Bank.prototype.createAndAddCustomer = function(userName, userPassword)								//changed to prototype
	{
		// Create a new customer
		let customer = new Customer(userName, userPassword);											// changed var to let
		
		// Save the customer
		this.customers[customer.getUserName()] = customer;
	}
	
	// ----------------------------------------------
	// Allows the user to enroll in the bank (the UI)
	// ----------------------------------------------
	Bank.prototype.createCustomerUI = function()														// changed to prototype
	{
		// Create user name
		let userName = readline.question("Please pick a user name: ");									// changed var to let
		
		// Pick the password 
		let userPassword = readline.question("Please pick a user password: ");							//changed var to let
		
		// Create and add user
		this.createAndAddCustomer(userName, userPassword);
		
		console.log("Created account for ", userName);
	}

	// -----------------------------------------------
	// The user action selection menu
	// @param customer - the customer 
	// -----------------------------------------------
	Bank.prototype.userActionMenuUI = function(customer)										// changed to a prototype
	{
		let choice = null;												//initialized choice to insure another choice option
		do
		{
			// Get the user input and create a customer object
			console.log("-----------------------------------------------");
			console.log("1. Deposit");
			console.log("2. Withdraw");
			console.log("3. Transfer");
			console.log("4. View Accounts");
			console.log("5. Open New Account");
			console.log("6. Remove Account");
			console.log("7. Logout");
			console.log("-----------------------------------------------\n\n");

			// Accept input
			choice = readline.question("Choice: ");										//removed var
			
			//checks if inputs are valid and numbers 1-6
			while(isNaN(choice) || !isFinite(choice) || !Number.isInteger(parseFloat(choice)) || parseInt(choice) <= 0 || parseInt(choice) > 7)			// created a while loop to check for valid numbers only
			{
				console.log("-----------------------------------------------");
				console.log("1. Deposit");
				console.log("2. Withdraw");
				console.log("3. Transfer");
				console.log("4. View Accounts");
				console.log("5. Open New Account");
				console.log("6. Remove Account");
				console.log("7. Logout");
				console.log("-----------------------------------------------\n\n");
				console.log("Please enter a valid input.\n");
			
				choice = readline.question("Choice: ");
			}
			
			// Decide what to do
			
			// Deposit	
			if(parseInt(choice) === 1)															//changed == to === / parseInt()
			{
				if(customer.accounts.length < 1) 												//created an if statement for 0 accounts opened
				{
					console.log("\nYou have 0 active accounts open.");
					console.log("Please, press 5 to activate a new account. \n");
				}
				else
				{
					console.log("Deposit");
					this.depositUI(customer);
				}
			}
			// Withdraw
			else if(parseInt(choice) === 2)														//changed == to === / parseInt()
			{
				if(customer.accounts.length < 1)												//created an if statement for 0 accounts opened
				{
					console.log("\nYou have 0 active accounts open.");
					console.log("Please, press 5 to activate a new account. \n");
				}
				else
				{
					console.log("Withdraw");
					this.withdrawUI(customer);
				}
			}
			// Transfer
			else if(parseInt(choice) === 3)														//changed == to === / parseInt()
			{
				if(customer.accounts.length === 0)												//created an if statement for 0 accounts opened
				{
					console.log("\nYou have 0 active accounts open, need a minimum of 2 accounts.");
					console.log("Please, press 5 to activate a new account. \n");
				}
				else if(customer.accounts.length === 1)											//created an if statement for 1 account opened
				{
					console.log("\nYou have 1 active account open, need a minimum of 2 accounts.");
					console.log("Please, press 5 to activate a new account. \n");
				}
				else
				{
					console.log("Transfer");
					this.transferUI(customer);
				}
			}
			// View accounts
			else if(parseInt(choice) === 4)														//changed == to === / parseInt()
			{
				if(customer.accounts.length < 1)												//created an if statement for 0 account opened
				{
					console.log("\nYou have 0 active accounts open.");
					console.log("Please, press 5 to activate a new account. \n");
				}
				else
				{
					console.log("View Accounts");
					this.viewAccounts(customer);
				}
				
			}
			// Open new account
			else if(parseInt(choice) === 5)														//changed == to === / parseInt()
			{
				console.log("Open New Account");
				this.openAccountUI(customer);
			}
			// Close customer account
			else if(parseInt(choice) === 6)														//changed == to === / parseInt()
			{
				if(customer.accounts.length < 1)												//created an if statement for 0 account opened
				{
					console.log("\nYou have 0 active accounts open.");
					console.log("Please, press 5 to activate a new account. \n");
				}
				else
				{
					console.log("Remove Account");
					this.closeAccount(customer);													//missing semicolon ;
				}
			}
		}
		while(parseInt(choice) !== 7);																//changes != to !==
	}
	
	
	// -------------------------------------------
	// Prints the accounts
	// @param customer - the customer for which
	// to print the customer
	// -------------------------------------------
	Bank.prototype.viewAccounts = function(customer) 												//changed to a prototype
	{	
		// Get the accounts
		let accounts = customer.getAccounts();														//changed var to let
		
		// The account counter
		let accountNum = 1;																			//changed var to let
			
		// Print the accounts
		for(account of accounts)
		{
			console.log("Account ", accountNum);
			account.printAcct();
			
			// Next account
			accountNum += 1;
		}
	} 
		
	// ------------------------------------------------------------
	// Master choice menu
	// ------------------------------------------------------------
	Bank.prototype.masterChoice = function()														//changed to prototype
	{
		let choice = 0;									// choice has to be outside scope to check in do while
		do
		{
			console.log("What would you like to do?");
			console.log("1. Login");
			console.log("2. Create Account\n");
			
			// make sure input is either 1 or 2
			while(true)
			{
				// Get the choice
				choice = readline.question("Choice: ");	// changed var to let
				choice = parseInt(choice);				// make sure choice is int 
				if(choice === 1 || choice === 2)	    // make sure its either 1 or 2
					break;
				else
				{
					console.log("Invalid input. Try again.");
				}
			}
			
			// Login
			if(choice === 1)	
				this.loginUI();

			// Create new user account
			else if (choice === 2)
				this.createCustomerUI();

		}while(choice != 1 && choice != 2);
	}
	
	// -------------------------------------------------------------
	// The login menu
	// -------------------------------------------------------------
	Bank.prototype.loginUI = function()
	{
		let match = false;											// match has to be outside scope to use in do
		let userName = '';											// username has to be out of scope too
		do
		{
			console.log("Please enter your user name and password");
		
			// Get the user name
			userName = readline.question("Username: ");			
	
			// Get the password	
			let userPassword = readline.question("Password: ");		// change var to let
				
			// Whether there was a match
			match = this.login(userName, userPassword);	
		} while(!match);
		
		// Get the customer
		let customer = this.getCustomer(userName);					// change var to let
		
		// Show the user menu
		this.userActionMenuUI(customer);
	}
	
			
	// -----------------------------------------------
	// Checks the provided user credentials
	// @param userName - the user name
	// @param userPassword - the user password
	// -----------------------------------------------
	Bank.prototype.login = function(userName, userPassword)
	{		
		// The match
		let match = false;										// change var to let
		
		// Is this a registered user?
		if(userName in this.customers)
		{
			// Get the customer
			let customer = this.customers[userName];			// change var to let
			
			// Check the password
			if(customer.getPassword() == userPassword) { match = true; }
		}
		
		return match;
	}
	
	// ----------------------------------------------------
	// Adds a new account (e.g., savings or checking for the 
	// existing user.
	// @param customer - the customer
	// @param acctName - the account name
	// @param initialDeposits - the initial deposit
	// @param type - the type of account: either "checking"
	// or "savings".
	// @return - the object of type Account rerepsenting
	// the newly created account
	// ---------------------------------------------------
	Bank.prototype.createAccount = function(customer, acctName, initialDeposits, type)
	{
		// Create a new account
		let account = new Account(acctName, initialDeposits, type);
		
		// Add account to the user
		customer.addAccount(account);
	}	
	
	
	// ----------------------------------------------------
	// Opens an new account for the existing customer (UI)
	// @param customer - the customer for whom to open
	// the account
	// ------------------------------------------------------
	Bank.prototype.openAccountUI = function(customer)
	{
		// The account name
		let accountName = readline.question("Please choose an account name: ");	
		
		// Get the account type
		let accountType = '';
		
		// The account type
		let choosenType = null;
		
		while(true)												// make sure account chosen is either 1 or 2
		{
			accountType = readline.question("Please choose (1) for savings and (2) for checking: ");
			accountType = parseInt(accountType);
			// The account type: savings or checking
			if(accountType === 1) { choosenType = "savings"; break;}
			else if(accountType === 2){ choosenType = "checking"; break;}
			else {console.log("Invalid input. Try again.")}
		}


		// make sure deposit is a number and greater than 0
		let initialDeposit = 0
		while(true)
		{
			// The initial deposit	
			initialDeposit = readline.question("Please enter the deposit amount: ");
			initialDeposit = Math.trunc(parseFloat(initialDeposit) * 100) / 100;
			if(initialDeposit > 0)
				break;
			else
				console.log("Invalid input. Try again.")
		}

		// The account name
		this.createAccount(customer, accountName, parseFloat(initialDeposit), accountType);
	}

	// ------------------------------------------------------
	// The UI for depositing money
	// @param user - the owner of the account
	// ------------------------------------------------------
	Bank.prototype.depositUI = function(user)
	{
		// The deposit account
		//MIG: Stopped here
		
		// Show all accounts of the user
		this.viewAccounts(user);
		
		// make sure choice is between 1 and account.length
		let accountIndex = 0
		while(true)
		{
			// Get the account choice
			accountIndex = readline.question("Please select an account by entering a choice (e.g., enter 1 for the first account) ");
			accountIndex = Math.trunc(parseInt(accountIndex) * 100) / 100;												// if input is 3 decimal place then changes to only 2
			
			if(accountIndex > 0 && accountIndex <= user.accounts.length)
				break;	
			else
				console.log("Invalid input. Try again.");
		}
	
		// Get the account based on index
		let account = user.getAccount(accountIndex - 1);	
		
		// make sure amount is a number and positive
		let depositAmount = 0;
		while(true)
		{
			// Get the deposit amount
			depositAmount = readline.question("Please enter the deposit amount: ");
			depositAmount = parseFloat(depositAmount);
			if(depositAmount > 0)
				break;
			else
				console.log("Not a valid input. Try again.")
		}
		
		// Deposit the money	
		account.deposit(depositAmount);			
		
		console.log("Updated account information: ");
		account.printAcct();		
	}

	// ------------------------------------------------------
	// The UI for withdrawing the money
	// ------------------------------------------------------
	Bank.prototype.withdrawUI = function(customer)
	{	
		// Show all accounts of the user
		this.viewAccounts(customer);
		
		// Get the account choice
		let accountIndex = 0;								
		while(true)																						//created while loop to prevent crash if wrong input 
		{
			accountIndex = readline.question("Please select an account by entering a choice (e.g., enter 1 for the first account) ");
			accountIndex = parseInt(accountIndex);
			
			if(accountIndex > 0 && accountIndex <= customer.accounts.length)
				break;
			else
				console.log("Invalid input. Try again.");
		}
		
		// Get the account based on index
		let account = customer.getAccount(accountIndex - 1);					
		
		// make sure withdraw amount is > 0 and a number
		// we are allowing the user to withdraw more than they have to 
		// charage them overdraft fees
		let withdrawAmount = 0;
		while(true)																						//created while loop to prevent wrong input
		{
			// Get the withdraw amount
			withdrawAmount = readline.question("Please enter the withraw amount: ");
			withdrawAmount = Math.trunc(parseFloat(withdrawAmount) * 100) / 100;									// if input is 3 decimal place then changes to only 2
			if(withdrawAmount > 0)
				break;
			else
				console.log("Not a valid input. Try again.")
		}
		
		// Deposit the money	
		account.withdraw(withdrawAmount);			
		
		// Show the updated account information	
		console.log("Updated account information: ");
		account.printAcct();
	}

	// -----------------------------------------------------
	// The UI for transferring the money
	// @param customer - the customer for whom to perform the
	// transaction
	// -----------------------------------------------------
	Bank.prototype.transferUI = function(customer)
	{
		// Show the account information
		this.viewAccounts(customer);
			
		// Get the source account
		let accountIndex = 0;
		while(true)
		{
			accountIndex = readline.question("Please select the source account by entering a choice (e.g., enter 1 for the first account) ");
			accountIndex = parseInt(accountIndex);
			
			if(accountIndex > 0 && accountIndex <= customer.accounts.length)
				break;
			else
				console.log("Not a valid input. Try again");
		}
		// Get the destination account based on index
		let srcAccount = customer.getAccount(accountIndex - 1);
		
		// Get the destination account
		while(true)
		{
			accountIndex = readline.question("Please select the destination by entering a choice (e.g., enter 1 for the first account) ");
			accountIndex = parseInt(accountIndex);
			
			if(accountIndex > 0 && accountIndex <= customer.accounts.length)
				break;
			else
				console.log("Not a valid input. Try again");
		}
		
		// Get the destination account based on index
		let dstAccount = customer.getAccount(accountIndex - 1);		
		
		
		// Get the transfer amount						// make sure the amount is less than or equal to the amount in that account
		let transferAmount = 0;
		while(true)
		{
			transferAmount = readline.question("Please enter the transfer amount: ");
			transferAmount = Math.trunc(parseFloat(transferAmount) * 100) / 100;
			
			if(transferAmount <= srcAccount.acctBalance && transferAmount > 0)
				break;
			else
				console.log("Not a valid input. Try again")
		}
		
		// Withdraw the money from the source account
		srcAccount.withdraw(transferAmount);
		
		// Deposit the money	
		dstAccount.deposit(transferAmount);			
		
		console.log("Updated account information: ");
		srcAccount.printAcct();
		console.log("\n");
		dstAccount.printAcct();
	}
		
	// ---------------------------------------------
	// Shows all the user accounts
	// @param user - the user whose accounts to view
	// ----------------------------------------------
	Bank.prototype.showAccounts = function(user)
	{
		// Get the accounts
		let accounts = user.getAccounts();						// changed var to let
		
		console.log(accounts);
			
		// The account number
		let acctNum = 0;										// changed var to let
		
		// Print all the accounts
		for(account of accounts)
		{
			console.log(acctNum, account.getName(), " ", account.getBalance())
		}
	}

	// Created a function to close a bank account
	Bank.prototype.closeAccount = function(customer)														//created close account function
	{
		// Get the account choice to close
		let accountIndex = 0;
	
		while(true)
		{
			accountIndex = readline.question("Please select the account you wish to delete permanently (e.g., enter 1 for the first account): ");
			if(accountIndex > 0 && accountIndex <= customer.accounts.length)
				break;
			else
				console.log("Invalid input. Try again.");
		}

		// Get the account based on index
		let account = customer.getAccount(accountIndex - 1);
		
		// Compare the 2 accounts
		let accountIndex2 = 0;
		if(customer.accounts.length > 1) 
		{
			// Get the destination account
			accountIndex2 = readline.question("Please select which account to transfer the remaining funds (e.g., enter 1 for the first account): ");
		
			// Check that the user input a valid account and not the same account they're trying to remove.
			while(isNaN(accountIndex2) || !isFinite(accountIndex2) || !Number.isInteger(parseFloat(accountIndex2)) || parseInt(accountIndex2) <= 0 
					|| parseInt(accountIndex) === parseInt(accountIndex2) || parseInt(accountIndex2) > (customer.accounts.length))
			{
				if(Number.isInteger(parseFloat(accountIndex2)) && parseInt(accountIndex2) === parseInt(accountIndex))
				{
					console.log("\nInvalid input. Please select an account you have not selected already");
				}
				console.log("Invalid input. Try again");
				accountIndex2 = readline.question("Please select which account to transfer the remaining funds (e.g., enter 1 for the first account): ");
			}

			// Get the destination account based on index
			let dstAccount = customer.getAccount(accountIndex2 - 1);	
	
	
			//Transfer money from closed account to other account
			newBalance = parseFloat(account.acctBalance) + parseFloat(dstAccount.acctBalance)
			dstAccount.acctBalance = Math.trunc(newBalance * 100) / 100 ;

		}
		
		// Warning for user that they're about to delete last account
		this.viewAccounts(customer);
		if (customer.accounts.length <= 1) 
		{
			console.log("Careful, you are about to delete your last account!");
		}
	
		// Removes the account from list of accounts
		customer.accounts.splice(accountIndex - 1, 1);
		this.viewAccounts(customer);
	}
	
	// --------------------------------------------
	// Returns the customer based on the user name
	// @param userName - the user name
	// @return - the user name
	// --------------------------------------------
	Bank.prototype.getCustomer = function(userName) 
	{ 
		return this.customers[userName]; 
	}
	
	// Opens the bank for business.
	Bank.prototype.start = function()
	{
		// Keep running
		while(true) 
		{
			this.masterChoice();
			
			// Clear screen
			clearScreen();		//changed screeen to screen
		}
	}

// ---- Sample Test Code --------

// Create three customers
let c1 = new Customer("mike", "123");							// changed var to let
let c2 = new Customer("pike", "234");							// changed var to let
let c3 = new Customer("bike", "678");							// changed var to let

// Add accounts to each customer
c1.addAccount(new Account("bills", 100, "savings"));
c1.addAccount(new Account("dills", 200, "checking"));

c2.addAccount(new Account("wills", 300, "savings"));
c2.addAccount(new Account("kills", 400, "checking"));

c3.addAccount(new Account("chills", 300, "savings"));
c3.addAccount(new Account("thrills", 400, "checking"));

// Create a list of customers
let customers = [c1, c2, c3];									//changed var to let

// Create a bank object
let myBank = new Bank("Kitty Bank", customers);					// changed var to let

myBank.start();
