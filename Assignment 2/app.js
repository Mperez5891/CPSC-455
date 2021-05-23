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

// Needed for security
const xssFilters = require('xss-filers');

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

// Parses a database of usernames and passwords
// @param dbFile - the database file
// @return - the list of user name and passwords
function parseDB(dbFile)
{
	// Read the file
	fs.readFile(dbFile, "utf8", function(error, data){

		console.log(data);
		data.split(";");

	});
}

// The handler for the home page
// @param req - the request
// @param res - the response
app.get("/", function(req, res){

	if(req.mysession.loggedin)
	// Is this user logged in?
	{
		console.log("You're in");
		res.redirect('/dashboard');
	}
	else
	{
		// Login required
		res.sendFile(path.join(__dirname+ '/index.html'));
	}
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
			res.redirect('/dashboard');
		}
		else
		{
			// If no matches have been found, we are done
			res.send("<b>Failed authentication</b>");
		}
	});
});

// The end-point for logging out
app.post("/logout", function(req, res){

	// Kill the session
	req.mysession.reset();
	console.log("Session Cleared!");
	res.redirect('/');

});

// The end-point for creating an account
app.post("/create", function(req, res){



});

app.get("/results", function(req, res){

  let name = "test json first and last name";
  let accNum = "test json 12345";
  let totBal = "test json $10.00";

  //write json object into .json file
  let o = {11:"a", 22:"b",33:"c"};
  let jsonO = JSON.stringify(o, null, 2);
  fs.writeFileSync('accountData.json',jsonO);

  //res.json(o);
  res.sendFile(__dirname + "/results.html");



});

// The end-point for testing
app.get("/test", function(req, res){
	getAccounts('person1')
	.then(function(rows) {
		console.log(rows);
	})
	.catch((err) => setImmediate(() => { throw err; }));
});

// HELPER FUNCTIONS //////////////////////////////////
// Deposits money in the account named
// @param accountName - the name of the account to deposit in
// @param amount - amount to deposit
function deposit(accountName, amount)
{		
	// Construct the query to get amount
	let query = "USE bankDB; SELECT amount FROM userAccounts WHERE accountName = '" + accountName + "'"; 
	let currentBalance = 0;
	
	// Query the DB for the user
	try{
		mysqlConn.query(query, function(err, qResult){
			if(err) throw err;			
				
			// Go through the results of the second query
			qResult[1].forEach(function(account){
				currentBalance = account['amount']
				
				// Base case
				if(amount <= 0)
					throw err;
				else
				{
					// Calculate new balance
					currentBalance += amount;
					
					// Update DB
					// Construct the query to get amount
					let query = "USE bankDB; UPDATE userAccounts SET amount = " + currentBalance + " WHERE accountName = '" + accountName + "'"; 
			
					// Update amount
					mysqlConn.query(query, function(err, result){
						if(err) throw err;		
						console.log('Deposit complete!');	
					});
				}
			});
		});
	}
	catch(err){res.send("<b>Failed query</b>");}
}

function withdraw(accountName, amount)
{		
	// Construct the query to get amount
	let query = "USE bankDB; SELECT amount FROM userAccounts WHERE accountName = '" + accountName + "'"; 
	let currentBalance = 0;
	
	// Query the DB for the user
	try{
		mysqlConn.query(query, function(err, qResult){
			if(err) throw err;			
				
			// Go through the results of the second query
			qResult[1].forEach(function(account){
				currentBalance = account['amount']
				
				// Base case
				if(amount <= 0 || amount > currentBalance)
					throw err;
				else
				{
					// Calculate new balance
					currentBalance -= amount;
					
					// Update DB
					// Construct the query to get amount
					let query = "USE bankDB; UPDATE userAccounts SET amount = " + currentBalance + " WHERE accountName = '" + accountName + "'"; 
			
					// Update amount
					mysqlConn.query(query, function(err, result){
						if(err) throw err;		
						console.log('Withdraw complete!');	
					});
				}
			});
		});
	}
	catch(err){res.send("<b>Failed query</b>");}
}

function getAccounts(username)
{
	return new Promise((resolve, reject)=>{
		let query = 'USE bankDB; SELECT users.userName, accountName, amount FROM userAccounts JOIN users ON users.userID = userAccounts.userID;'
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


app.listen(3000);
