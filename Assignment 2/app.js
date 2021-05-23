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


//Creating an endpoint to send JSON object with data
app.get("/jsonData", function(req,res){



  //hardcoded test values
  let name = "test json first and last name";
  let accNum = "test json 12345";
  let totBal = "test json $10.00";
  let customerAccounts = ['a1', 'a2', 'a3'];

  //write json object into .json file
  let o = {
            "val1":name,
            "val2":accNum,
            "val3":totBal,
            "val4":customerAccounts
          };

  //create internal json file to allow programmer to view
  let jsonO = JSON.stringify(o, null, 2);
  fs.writeFileSync('accountData.json',jsonO);

  //console.log(jsonO);
  //res.setHeader('Content-Type', 'application/json')

  //res.send(jsonO);

  //respond with json file. Below is function way of doing it
  res.json(o);

});

//can look at JSON Data
app.get("/displayJSONData", function(req, res){

  res.sendFile(__dirname + "/displayJData.html");
});

app.get("/results", function(req, res){


  res.sendFile(__dirname + "/results.html");

});

app.post("/deposit", function(req, res){

  res.sendFile(__dirname + "/deposit.html");
});

app.post("/withdraw", function(req, res){

  res.sendFile(__dirname + "/withdraw.html");
});

app.post("/transfer", function(req, res){
  let choice = req.body;
  res.send(choice);

});

app.get("/transfer", function(req, res){

  res.sendFile(__dirname + "/transfer.html");

});

app.get("/nextAccount", function(req, res){

    res.send("Work In Progress")

});

app.get("/addAccount", function(req, res){

  res.send("Work In Progress")

});

app.post("/selectAccount", function(req, res){
  let choice = req.body;
  res.send(choice);
});

app.listen(3000);
