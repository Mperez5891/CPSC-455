'use strict'

// Import the stuff for the express framework
const express = require('express');
const fs = require('fs');

// Needed for session
const session = require('client-sessions');

// Needed for DB
const mysql = require('mysql');

// Needed to parse the request body
const bodyParser = require("body-parser");
const path = require('path')
const app     = express();

//import from express
app.use(express.json());

// Needed to parse the request body
//Note that in version 4 of express, express.bodyParser() was
//deprecated in favor of a separate 'body-parser' module.
app.use(bodyParser.urlencoded({ extended: true }));

// Basic cookie configuration
app.use(session({
  cookieName: 'mysession',
  secret: '0GBlJZ9EKBt2Zbi2flRPvztczCewBxXK',
  duration: 30000,
  activeDuration: 5 * 60 * 1000,
  httponly: true
}));

// Create the connection to your DB
const  mysqlConn = mysql.createConnection({
	host: "localhost",
	user: "appaccount",
	password: "apppass",
	multipleStatements: true

});

let authObj = new Object();

// The handler for the home page
// @param req - the request
// @param res - the response
app.get("/", function(req, res){

	if(req.mysession.loggedin && authObj.authenticated === true)
	// Is this user logged in?
	{
		console.log("You're in");
		res.redirect('/results');
	}
	else
	{
		logout();
		req.mysession.reset();
		// Login required
		res.sendFile(path.join(__dirname+ '/index.html'));
	}
});


app.post("/transfer1", function(req, res){
	
	let srcAccount = req.body.srcAccountName;
	let dstAccount = req.body.dstAccountName;
	let amount = parseInt(req.body.amount);
	let userName = authObj.username;
	
	console.log("Src: " + srcAccount)
	console.log("Dest: " + dstAccount)
	
	let sourceAccountExists = false;
		
	let dstAccountExists = false;

	let result = getAccounts(userName)	
	
	result.then(function(rows){
					
		for(let row in rows)
		{
			console.log("Row");
			console.log(rows[row]);
			
			if(rows[row].accountName === srcAccount)
			{
						sourceAccountExists = true;
						console.log("Found the source")
			}
	
			else if(rows[row].accountName === dstAccount)
			{
						dstAccountExists = true;
						console.log("Found the destination")
			}
			
			if(sourceAccountExists && dstAccountExists) { break ; }
		}

		// We found both accounts
		if(sourceAccountExists && dstAccountExists)
		{
			let currentBalance = 0;
			
			// Construct the query to get amount
			let query = "SELECT amount FROM userAccounts "
			+ "JOIN users ON users.userID = userAccounts.userID "
			+ "WHERE users.userName = '" + userName + "' AND accountName = '" + srcAccount + "'";

				
			// Query the DB for the user
			try{
				mysqlConn.query(query, function(err, results){
				if(err) throw err;			
				try{
				currentBalance = results[0].amount;
			
				// Base case
				if(amount <= 0 || amount > currentBalance)
					throw err;
				else
				{
					// Calculate new balance
					currentBalance = (Math.trunc(currentBalance * 100) - Math.trunc(amount * 100)) / 100;;
					
					// Update DB
					// Construct the query to get amount
					let query = "USE bankDB; UPDATE userAccounts "
					+ "JOIN users ON users.userID = userAccounts.userID "
					+ "SET amount = " + currentBalance
					+ " WHERE users.userName = '" + userName + "' AND accountName = '" 
					+ srcAccount + "'";
					
					console.log(query);
							
					// Update amount
					mysqlConn.query(query, function(err, result){
						if(err) throw err;		
						//console.log('Withdraw complete!')


				// DEPOSIT BEGINS	
				try{

				let query = "SELECT amount FROM userAccounts "
				+ "JOIN users ON users.userID = userAccounts.userID "
				+ "WHERE users.userName = '" + userName + "' AND accountName = '" + dstAccount + "'";

				mysqlConn.query(query, function(err, results){
						if(err) throw err;			
						try{
						currentBalance = results[0].amount;

						// Base case
						if(amount <= 0)
						throw err;
						else
						{
						// Calculate new balance
						currentBalance = (Math.trunc(currentBalance * 100) + Math.trunc(amount * 100)) / 100;;

						// Update DB
						// Construct the query to get amount
						let query = "USE bankDB; UPDATE userAccounts "
						+ "JOIN users ON users.userID = userAccounts.userID "
						+ "SET amount = " + currentBalance
						+ " WHERE users.userName = '" + userName + "' AND accountName = '" 
						+ dstAccount + "'";
						
						// Update amount
						mysqlConn.query(query, function(err, result){
								if(err) throw err;		
								console.log('transfer complete!');	
								});

							res.redirect("/test");
						}
						}
						catch(err){console.log('Failed transfer');  res.send("Failed trasnfer");}
				});
				}
				catch(err){console.log('Failed trasnfer 2'); res.send("Failed trasnfer 2")}

				});
					}
				}
			catch(err){console.log('Failed withdraw 1');}
			});
		}
		catch(err){console.log('Failed withdraw 2');}

			}
			else
			{
				res.send("Invalid account name");
			}

				
				

		})

						
							
							
	})

	
	

app.post("/deposit1", function(req, res){
		console.log("In withdraw 1");
		let accountName = req.body.accountName;	
		let amount = parseInt(req.body.amount);

		let userName = authObj.username;

		let result = getAccounts(userName)	
		
		console.log(accountName)
		console.log(amount)
		console.log(userName)
		
		result.then(function(rows){
					
				let found = false;	
				for(let row in rows)
				{
					console.log("Row");
					console.log(rows[row]);
					if(rows[row].accountName === accountName)
					{
						found = true;
						break
					}
				}
			if(found)
			{
				// Construct the query to get amount
				let query = "SELECT amount FROM userAccounts "
				+ "JOIN users ON users.userID = userAccounts.userID "
				+ "WHERE users.userName = '" + userName + "' AND accountName = '" + accountName + "'";
				let currentBalance = 0;

				// Query the DB for the user
				try{
				mysqlConn.query(query, function(err, results){
						if(err) throw err;			
						try{
						currentBalance = results[0].amount;

						// Base case
						if(amount <= 0)
						throw err;
						else
						{
						// Calculate new balance
						currentBalance = (Math.trunc(currentBalance * 100) + Math.trunc(amount * 100)) / 100;;

						// Update DB
						// Construct the query to get amount
						let query = "USE bankDB; UPDATE userAccounts "
						+ "JOIN users ON users.userID = userAccounts.userID "
						+ "SET amount = " + currentBalance
						+ " WHERE users.userName = '" + userName + "' AND accountName = '" 
						+ accountName + "'";

						// Update amount
						mysqlConn.query(query, function(err, result){
								if(err) throw err;		
								console.log('Deposit complete!');	
								});

							res.redirect("/test");
						}
						}
						catch(err){console.log('Failed deposit');  res.send("Failed deposit");}
				});
				}
				catch(err){console.log('Failed deposit'); res.send("Failed deposit 2")}
			}
			else
			{
				res.send("Invalid account name");
			}

				
				

		})

			
})


app.post("/withdraw1", function(req, res){

			
		console.log("In withdraw 1");
		let accountName = req.body.accountName;	
		let amount = parseInt(req.body.amount);

		let userName = authObj.username;

		let result = getAccounts(userName)	
		
		console.log(accountName)
		console.log(amount)
		console.log(userName)
		
		result.then(function(rows){
					
				let found = false;	
				for(let row in rows)
				{
					console.log("Row");
					console.log(rows[row]);
					if(rows[row].accountName === accountName)
					{
						found = true;
						break
					}
				}
					
				if(found)
				{
				// Construct the query to get amount
				let query = "SELECT amount FROM userAccounts "
				+ "JOIN users ON users.userID = userAccounts.userID "
				+ "WHERE users.userName = '" + userName + "' AND accountName = '" + accountName + "'";
				let currentBalance = 0;

				// Query the DB for the user
				try{
				mysqlConn.query(query, function(err, results){
						if(err) throw err;			
						try{
						currentBalance = results[0].amount;

						// Base case
						if(amount <= 0 || amount > currentBalance)
						throw err;
						else
						{
						// Calculate new balance
						currentBalance = (Math.trunc(currentBalance * 100) - Math.trunc(amount * 100)) / 100;;

						// Update DB
						// Construct the query to get amount
						let query = "USE bankDB; UPDATE userAccounts "
						+ "JOIN users ON users.userID = userAccounts.userID "
						+ "SET amount = " + currentBalance
						+ " WHERE users.userName = '" + userName + "' AND accountName = '" 
						+ accountName + "'";

						// Update amount
						mysqlConn.query(query, function(err, result){
								if(err) throw err;		
								console.log('Withdraw complete!');	
								});

							res.redirect("/test");
						}
						}
						catch(err){console.log('Failed withdraw');  res.send("Failed withdraw");}
				});
				}
				catch(err){console.log('Failed withdraw'); res.send("Failed withdraw 2")}
			}
			else
			{
				res.send("Invalid account name");
			}

				
				

		})


});

// The handler for the request of the login page
// @param req - the request
// @param res - the response
app.post('/login', function(req, res) {

	// Get the username and password data from the form
	let userName = req.body.username;
	let password = req.body.password;

	// Construct the query
	let query = "USE bankDB; SELECT username,password from users where userName='" + userName + "' AND password='" + password + "'";
	console.log(query);

	// Query the DB for the user
	mysqlConn.query(query, function(err, qResult){

		if(err) throw err;
		console.log(qResult[1]);

		// Does the password match?
		let match = false;

		// Go through the results of the second query
		qResult[1].forEach(function(account){

			if(account['username'] == userName && account['password'] == password)
			{
				console.log("Match!");

				// We have a match!
				match = true;

				//break;
			}
		});

		// Login succeeded! Set the session variable and send the user
		// to the dashboard
		if(match)
		{
			// update the cookie
			let randomNumber=Math.random().toString();
			randomNumber=randomNumber.substring(2,randomNumber.length);

			req.mysession.loggedin = randomNumber;
			authObj.username = userName;
			authObj.authenticated = true;
			res.redirect('/results');
		}
		else
		{
			// If no matches have been found, we are done
			res.send("<b>Failed authentication</b>");
		}
	});
});

/**
app.get("/withdaw1", function(req, res){
	
	let htmlString = "<html><body>" + \
	"<script>await fetch("http://localhost:3000);

		

})
**/

// The end-point for logging out

app.get("/test", function(req, res){
	
	res.sendFile(__dirname + "/results.html");	

})

function logout()
{
	// Kill the session
	authObj = new Object();
	console.log("Session Cleared!");
}

// The end-point for creating an account
app.post("/create", function(req, res){
    let userName = req.body.createusername;
    let password = req.body.createpassword;
    let name = req.body.createname;
    let address = req.body.address;
    let query = "USE bankDB; INSERT INTO users (userName, password, name, address) VALUES ('" + userName + "','" + password + "','" + name + "','" + address + "')";
    console.log(query);
    mysqlConn.query(query, function(err, qResult) {
        if(err) throw err;
        console.log("Successfully created account!");
    })
res.redirect('/results'); 
});

//Creating an endpoint to send JSON object with data
app.get("/jsonData", function(req,res){
	console.log("Inside jsonData");
	if(authObj.authenticated === true)
	{
		
		//let a = {b:"hello"};
	//	console.log("Sending a JSON object");	
//		console.log(a);	
//		res.json(a);
		let userName = authObj.username;
	
		let name = '';
		let accID = '';
		let customerAccounts = [];
		let temp;
		
		//write json object into .json file
		let o = {};
		
		// Get name
		getName(userName)
		.then(function(rows) {
			name = rows[0].name;
			
			getUserID(userName)
			.then(function(rows) {
				accID = rows[0].userID;
				
				getAccounts(userName)
				.then(function(rows) {
					temp = rows;
			
					for(let i = 0; i < temp.length; i++)
					{
						customerAccounts.push({'name':name, 'accID':accID, 'accountName':temp[i].accountName,'amount':temp[i].amount});
					}
					
					o = customerAccounts;
					console.log(o);
					 //create internal json file to allow programmer to view
					let jsonO = JSON.stringify(o, null, 2);
					fs.writeFileSync('accountData.json',jsonO);
					
					res.json(o);
				})
				.catch((err) => setImmediate(() => { throw err; }));
			})
			.catch((err) => setImmediate(() => { throw err; }));
		})
		.catch((err) => setImmediate(() => { throw err; }));
	}else
	{
		logout();
		req.mysession.reset();
		// Login required
		res.sendFile(path.join(__dirname+ '/index.html'));
	}
	
	
	// Get user ID
//	getUserID(userName)
//	.then(function(rows) {
//		o.accNum = rows[0].userID;
//	})
//	.catch((err) => setImmediate(() => { throw err; }));
	
	// Get accounts and amounts
//	getAccounts(userName)
//	.then(function(rows) {
//		temp = rows;
		
//		for(let i = 0; i < temp.length; i++)
//		{	
//			customerAccounts.push(temp[i].accountName);
//			totBal.push(temp[i].amount);
//		}
//		o.totBal = totBal;
//		o.customerAccounts = customerAccounts;
//	})
//	.catch((err) => setImmediate(() => { throw err; }));
	
  //create internal json file to allow programmer to view
//  let jsonO = JSON.stringify(o, null, 2);
// fs.writeFileSync('accountData.json',jsonO);

  //console.log(jsonO);
  //res.setHeader('Content-Type', 'application/json')

  //res.send(jsonO);

  //respond with json file. Below is function way of doing it
//  res.json(o);
});


//can look at JSON Data
app.get("/displayJSONData", function(req, res){
	if(req.mysession.loggedin && authObj.authenticated === true)
		res.sendFile(__dirname + "/displayJData.html");
	else
	{
		logout();
		req.mysession.reset();
		// Login required
		res.sendFile(path.join(__dirname+ '/index.html'));
	}	
});

app.get("/results", function(req, res){
	if(authObj.authenticated === true)
		res.sendFile(__dirname + "/results.html");
	else
	{
		logout();
		req.mysession.reset();
		// Login required
		res.sendFile(path.join(__dirname+ '/index.html'));
	}	
});

app.post("/logout", function(req, res) {
	logout();
	res.sendFile(__dirname + "/index.html");
});

app.post("/deposit", function(req, res){

  let userInput = req.body.amt;
  deposit(authObj.currentState, userInput);
  //res.send(authObj.currentState);
  res.sendFile(__dirname + "/results.html");
});

app.post("/withdraw", function(req, res){
  let userInput = req.body.amt;
  withdraw(authObj.currentState, userInput);
  res.sendFile(__dirname + "/results.html");
});

//app.get("/transfer", function(req, res){

//  res.sendFile(__dirname + "/transfer.html");

//});

app.post("/transfer", function(req, res){
  
  let userInput = req.body.tamt;
  transferAmount(authObj.currentState,authObj.currentState, userInput);
  res.sendFile(__dirname + "/results.html")
  //res.sendFile(__dirname + "/transfer.html");

});

app.get("/nextAccount", function(req, res){

    res.send("Work In Progress")

});

app.get("/addAccount", function(req, res){
	if(authObj.authenticated === true) {
		let userName = authObj.username;
		let userID = getUserID(userName);
	
		let accName = req.body.createAccName;
		let accBalance = req.body.createAccBalance;
		let query = "USE userAccounts; INSERT INTO userAccounts (userID, accuntName, amount) VALUES ('" + userID + "','" + accName + "','" + accBalance + "')";
		console.log(query);

		mysqlConn.query(query, function(err, qResult) {
		if(err) throw err;
		console.log(qResult[1]);
		})

		res.redirect('/results'); 
	}
	else {
		logout();
		req.mysession.reset();
		// Login required
		res.sendFile(path.join(__dirname+ '/index.html'));
	}
	
});

app.post("/selectAccount", function(req, res){
let choice = req.body;
console.log(choice);
authObj.currentState = choice.customerAccount;
console.log(authObj.currentState);
//res.send(choice);
res.sendFile(__dirname + "/results.html");
});

// HELPER FUNCTIONS //////////////////////////////////////////////////
// Deposits money in the account named
// @param accountName - the name of the account to deposit in
// @param amount - amount to deposit
function deposit(accountName, amount)
{		
	let userName = authObj.username;
	// Construct the query to get amount
	let query = "SELECT amount FROM userAccounts "
	+ "JOIN users ON users.userID = userAccounts.userID "
	+ "WHERE users.userName = '" + userName + "' AND accountName = '" + accountName + "'";
	let currentBalance = 0;
	
	// Query the DB for the user
	try{
		mysqlConn.query(query, function(err, results){
			if(err) throw err;			
			try{
				currentBalance = results[0].amount;
		
				// Base case
				if(amount <= 0)
					throw err;
				else
				{
					// Calculate new balance
					currentBalance = (Math.trunc(currentBalance * 100) + Math.trunc(amount * 100)) / 100;
					
					// Update DB
					// Construct the query to get amount
					let query = "USE bankDB; UPDATE userAccounts "
					+ "JOIN users ON users.userID = userAccounts.userID "
					+ "SET amount = " + currentBalance
					+ " WHERE users.userName = '" + userName + "' AND accountName = '" 
					+ accountName + "'";
								
					// Update amount
					mysqlConn.query(query, function(err, result){
						if(err) throw err;		
						console.log('Deposit complete!');	
					});
				}
			}
			catch(err){console.log('Failed deposit');}
		});
	}
	catch(err){console.log('Failed deposit');}
}

function withdraw(accountName, amount)
{		
	let userName = authObj.username;
	// Construct the query to get amount
	let query = "SELECT amount FROM userAccounts "
	+ "JOIN users ON users.userID = userAccounts.userID "
	+ "WHERE users.userName = '" + userName + "' AND accountName = '" + accountName + "'";
	let currentBalance = 0;
	
	// Query the DB for the user
	try{
		mysqlConn.query(query, function(err, results){
			if(err) throw err;			
			try{
				currentBalance = results[0].amount;
		
				// Base case
				if(amount <= 0 || amount > currentBalance)
					throw err;
				else
				{
					// Calculate new balance
					currentBalance = (Math.trunc(currentBalance * 100) - Math.trunc(amount * 100)) / 100;;
					
					// Update DB
					// Construct the query to get amount
					let query = "USE bankDB; UPDATE userAccounts "
					+ "JOIN users ON users.userID = userAccounts.userID "
					+ "SET amount = " + currentBalance
					+ " WHERE users.userName = '" + userName + "' AND accountName = '" 
					+ accountName + "'";
								
					// Update amount
					mysqlConn.query(query, function(err, result){
						if(err) throw err;		
						console.log('Withdraw complete!');	
					});
				}
			}
			catch(err){console.log('Failed withdraw');}
		});
	}
	catch(err){console.log('Failed withdraw');}
}

function getAccounts(username)
{
	return new Promise((resolve, reject)=>{
		let query = 'USE bankDB; SELECT accountName, '
		+ 'amount FROM userAccounts JOIN users ON users.userID = userAccounts.userID '
		+ "WHERE userName = '" + username + "'"; 
		mysqlConn.query(query, function(err, results){
			if(err) return reject(err);			
			else
			{
				let s = JSON.stringify(results[1]);
				let json = JSON.parse(s);
				resolve(json);
			}
		});
	});
}

function getName(username)
{
	return new Promise((resolve, reject)=>{
		let query = "USE bankDB; SELECT name "
		+ "FROM users WHERE userName = '" + username + "'";
		
		mysqlConn.query(query, function(err, results){
			if(err) return reject(err);			
			else
			{
				let s = JSON.stringify(results[1]);
				let json = JSON.parse(s);
				resolve(json);
			}
		});
	});
}

function getUserID(username)
{
	return new Promise((resolve, reject)=>{
		let query = "USE bankDB; SELECT userID "
		+ "FROM users WHERE userName = '" + username + "'";
		
		mysqlConn.query(query, function(err, results){
			if(err) return reject(err);			
			else
			{
				let s = JSON.stringify(results[1]);
				let json = JSON.parse(s);
				resolve(json);
			}
		});
	});
}

function transferAmount(accountName1, accountName2, amount)
{
	let userName = authObj.username;
	return new Promise((resolve, reject)=>{
		try{
			withdraw(userName, accountName1, amount);
		}
		catch(error)
		{
			return reject(error);
		}
		
		resolve();
	})
	
	.then(function() {
		deposit(userName, accountName2, amount);
	})
	.catch((error) => setImmediate(() => { throw error; }));
}


app.listen(3000);
