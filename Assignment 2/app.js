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

// Needed to parse the request body
//Note that in version 4 of express, express.bodyParser() was
//deprecated in favor of a separate 'body-parser' module.
app.use(bodyParser.urlencoded({ extended: true })); 

// Basic cookie configuration
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
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
	
	// Read the file	
	res.sendFile(path.join(__dirname+ '/index.html'));
	
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
			req.session.username = userName;
			res.redirect('/dashboard');
		}
		else
		{
			// If no matches have been found, we are done
			res.send("<b>Wrong</b>");				
		}
	});
});

// The end-point for creating an account
app.post("/create", function(req, res){


	
});



app.listen(3000);
