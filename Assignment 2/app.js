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

	if(req.mysession.loggedin && authObj[req.mysession.loggedin].authenticated === true)
	// Is this user logged in?
	{
		console.log("You're in");
		res.redirect("/results");
	}
	else
	{
		// Login required
		res.sendFile(path.join(__dirname+ '/index.html'));
	}
});

app.post("/transfer1", function(req, res){
	
	let srcAccount = req.body.srcAccountName;
	let dstAccount = req.body.dstAccountName;
	let amount = parseInt(req.body.amount);
	let userName = authObj[req.mysession.loggedin].username;
	
	let sourceAccountExists = false;
	let dstAccountExists = false;

	let result = getAccounts(userName)	
	
	result.then(function(rows){			
		for(let row in rows)
		{	
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
			let query = "SELECT `amount` FROM `userAccounts` JOIN `users` ON `users`.`userID` = `userAccounts`.`userID` WHERE `users`.`userName` = ? AND `accountName` = ?";
	
			// Query the DB for the user
			try{
				mysqlConn.query(query, [userName, srcAccount],function(err, results){
				if(err) res.send("<b>Transfer Withdraw Amount Not Found</b>");			
				try{
				currentBalance = results[0].amount;
			
				// Base case
				if(amount <= 0 || amount > currentBalance)
					res.send("<b>Transfer Withdraw Amount Invalid</b>");	
				else
				{
					// Calculate new balance
					currentBalance = currentBalance - amount;
					
					// Update DB
					// Construct the query to get amount
					let query = "USE bankDB; UPDATE `userAccounts` JOIN `users` ON `users`.`userID` = `userAccounts`.`userID` SET `amount` = ? WHERE `users`.`userName` = ? AND `accountName` = ?";
							
					// Update amount
					mysqlConn.query(query, [currentBalance, userName, srcAccount],function(err, result){
						if(err) res.send("<b>Transfer Withdraw Update Failed</b>");		

				// DEPOSIT BEGINS	
				try{

				let query = "SELECT `amount` FROM `userAccounts` JOIN `users` ON `users`.`userID` = `userAccounts`.`userID` WHERE `users`.`userName` = ? AND `accountName` = ?";

				mysqlConn.query(query, [userName, dstAccount],function(err, results){
					if(err) res.send("<b>Transfer Amount Not Found</b>");	
					try{
						currentBalance = results[0].amount;

						// Base case
						if(amount <= 0)
							res.send("<b>Transfer Amount Invalid</b>");	
						else
						{
						// Calculate new balance
						currentBalance = (Math.trunc(currentBalance * 100) + Math.trunc(amount * 100)) / 100;;

						// Update DB
						// Construct the query to get amount
						let query = "USE bankDB; UPDATE `userAccounts` JOIN `users` ON `users`.`userID` = `userAccounts`.`userID` SET `amount` = ? WHERE `users`.`userName` = ? AND `accountName` = ?";
						
						// Update amount
						mysqlConn.query(query, [currentBalance, userName, dstAccount],function(err, result){
								if(err) res.send("<b>Transfer Update Failed</b>");		
								console.log('transfer complete!');	
						});

							res.redirect("/results");
					}
					}
					catch(err){console.log('Failed transfer');  res.send("Failed trasnfer");}
				});
				}
				catch(err){console.log('Failed trasnfer 2'); res.send("Failed trasnfer 2")}

			});
			}
			catch(err){console.log('Failed withdraw 1');}
			});
		}
		catch(err){console.log('Failed withdraw 2');}

	}
	else
	res.send("Invalid account name");

	})						
});
	
app.post("/deposit1", function(req, res){
	let accountName = req.body.accountName;	
	let amount = parseInt(req.body.amount);
	let userName = authObj[req.mysession.loggedin].username;
	let result = getAccounts(userName)	
		
	result.then(function(rows){	
		let found = false;	
		for(let row in rows)
		{
			if(rows[row].accountName === accountName)
			{
				found = true;
				break
			}
		}
		if(found)
		{
			// Construct the query to get amount
			let query = "SELECT `amount` FROM `userAccounts` JOIN `users` ON `users`.`userID` = `userAccounts`.`userID` WHERE `users`.`userName` = ? AND `accountName` = ?";
			let currentBalance = 0;

			// Query the DB for the user
			try{
			mysqlConn.query(query, [userName, accountName],function(err, results){
				if(err) res.send("<b>No Amount Found</b>");			
				try{
					currentBalance = results[0].amount;

					// Base case
					if(amount <= 0)
						res.send("<b>Invalid amount</b>");	
					else
					{
						// Calculate new balance
						currentBalance = currentBalance + amount;

						// Update DB
						// Construct the query to get amount
						let query = "USE bankDB; UPDATE `userAccounts` JOIN `users` ON `users`.`userID` = `userAccounts`.`userID` SET `amount` = ? WHERE `users`.`userName` = ? AND `accountName` = ?";

						// Update amount
						mysqlConn.query(query, [currentBalance, userName, accountName],function(err, result){
							if(err) res.send("<b>Deposit Failed</b>");		
						});
						res.redirect("/results");
					}
				}
				catch(err){console.log('Failed deposit');  res.send("Failed deposit");}
			});
			}
			catch(err){console.log('Failed deposit'); res.send("Failed deposit 2")}
		}
		else
			res.send("Invalid account name");
		})		
});


app.post("/withdraw1", function(req, res){

		console.log("In withdraw 1");
		let accountName = req.body.accountName;	
		let amount = parseInt(req.body.amount);

		let userName = authObj[req.mysession.loggedin].username;

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
				let query = "SELECT `amount` FROM `userAccounts` JOIN `users` ON `users`.`userID` = `userAccounts`.`userID` WHERE `users`.`userName` = ? AND `accountName` = ?";
				let currentBalance = 0;

				// Query the DB for the user
				try{
				mysqlConn.query(query, [userName, accountName] ,function(err, results){
						if(err) res.send("<b>No Amount Found</b>");			
						try{
						currentBalance = results[0].amount;

						// Base case
						if(amount <= 0 || amount > currentBalance)
							res.send("<b>Invalid Amount</b>");	
						else
						{
						// Calculate new balance
						currentBalance = currentBalance - amount;

						// Update DB
						// Construct the query to get amount
						let query = "USE bankDB; UPDATE `userAccounts` JOIN `users` ON `users`.`userID` = `userAccounts`.`userID` SET `amount` = ? WHERE `users`.`userName` = ? AND `accountName` = ?";

						// Update amount
						mysqlConn.query(query, [currentBalance, userName, accountName], function(err, result){
							if(err) res.send("<b>Failed Withdraw</b>");	
							console.log('Withdraw complete!');	
						});

							res.redirect("/results");
					}
				}
				catch(err){console.log('Failed withdraw');  res.send("Failed withdraw");}
				});
			}
			catch(err){console.log('Failed withdraw'); res.send("Failed withdraw 2")}
		}
		else
			res.send("Invalid account name");
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
	let query = "USE bankDB; SELECT `username`, `password` FROM `users` WHERE `userName` = ? AND `password` = ?";

	// Query the DB for the user
	mysqlConn.query(query, [userName, password],function(err, qResult){

		if(err) throw err;

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

			// set the session to logged in
			req.mysession.loggedin = randomNumber;
			
			// Append obj
			let temp = {'username':userName, 'authenticated': true};
			authObj[randomNumber] = temp;
		
			res.redirect('/');
		}
		else
		{
			// If no matches have been found, we are done
			res.send("<b>Failed authentication</b>");
		}
	});
});

// Log out all the things and reset
app.post("/logout", function(req, res){
	delete authObj[req.mysession.loggedin];
	req.mysession.reset();
	console.log("Session Cleared!");
	res.redirect('/');
});

// The end-point for creating a user account
app.post('/create', function(req, res){
    let userName = req.body.createusername;
    let password = req.body.createpassword;
    let name = req.body.createname;
    let address = req.body.address;
    let query1 = "USE bankDB; INSERT INTO users (userName, password, name, address) VALUES (?,?,?,?)";
    
    mysqlConn.query(query1, [userName, password, name, address],function(err, qResult) {
        if(err) res.send("<b>Failed Create an Account</b>");
        console.log("Successfully created user account!");
       
    })
     res.sendFile(__dirname + "/index.html");
});

// The end-point for creating a bank account
app.post('/bankAccount', function(req, res) {
    	let username = authObj[req.mysession.loggedin].username;
	let accountName = req.body.createbankname;
	let newAmount = req.body.createamount;
	
	let sql = "USE bankDB; SELECT `userID` FROM `users` WHERE `userName` = ?";
	mysqlConn.query(sql, [username], function(err, qResult) {
        if(err) res.send("<b>Failed To Create A Bank Account</b>");
		let userID = qResult[1][0].userID;
        console.log("Successfully created bank account!");
		
		let query2 = "USE bankDB; INSERT INTO `userAccounts` (`userID`, `accountName`, `amount`) VALUES (?,?,?)";
		mysqlConn.query(query2, [userID, accountName, newAmount] ,function(err, qResult) {
        	if(err) res.send("<b>Failed To Create A Bank Account</b>");
        	console.log("Successfully created bank account!");
		})
		
   	 })
	res.redirect('/results');
});

//Creating an endpoint to send JSON object with data
app.get("/jsonData", function(req,res){

	if(req.mysession.loggedin && authObj[req.mysession.loggedin].authenticated === true)
	{
		let userName = authObj[req.mysession.loggedin].username;
		
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
				.catch((err) => setImmediate(() => { res.send("<b>Failed Accounts Query</b>");}));
			})
			.catch((err) => setImmediate(() => { res.send("<b>Failed ID Query</b>");}));
		})
		.catch((err) => setImmediate(() => {res.send("<b>Failed Name Query</b>"); }));
	}else
	{
		// Login required
		res.redirect('/logout');
	}
});

app.get("/results", function(req, res){
	if(req.mysession.loggedin && authObj[req.mysession.loggedin].authenticated === true)
		res.sendFile(__dirname + "/results.html");
	else
	        res.redirect('/logout');
});

app.get("/addAccount", function(req, res){
	if(req.mysession.loggedin && authObj[req.mysession.loggedin].authenticated === true) {
		let userID = getUserID(userName);
		let accName = req.body.createAccName;
		let accBalance = req.body.createAccBalance;
		
		let query = "USE bankDB; INSERT INTO `userAccounts` (`userID`, `accuntName`, `amount`) VALUES (?,?,?)";
		console.log(query);

		mysqlConn.query(query, [userID, accName, accBalance] ,function(err, qResult) {
		if(err) res.send("<b>Failed Add Account Query</b>");
		console.log(qResult[1]);
		})

		res.redirect('/results'); 
	}
	else 
		res.redirect('/logout');
	
});

// HELPER FUNCTIONS //////////////////////////////////////////////////
function getAccounts(username)
{
	return new Promise((resolve, reject)=>{
		let query = "USE bankDB; SELECT `accountName`, `amount` FROM `userAccounts` JOIN `users` ON `users`.`userID` = `userAccounts`.`userID` WHERE `userName` = ?"; 
		mysqlConn.query(query, [username], function(err, results){
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
		let query = "USE bankDB; SELECT `name` FROM `users` WHERE `userName` = ?";
		
		mysqlConn.query(query,[username] ,function(err, results){
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
		let query = "USE bankDB; SELECT `userID` FROM `users` WHERE `userName` = ?";
		
		mysqlConn.query(query, [username], function(err, results){
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
