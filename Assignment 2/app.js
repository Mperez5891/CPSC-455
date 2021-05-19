'use strict'

// Import the stuff for the express framework
const express = require('express');
const fs = require('fs');

// Needed to parse the request body
const bodyParser = require("body-parser");
const path = require('path');
const { nextTick } = require('process');
const app     = express();

// Needed to parse the request body
//Note that in version 4 of express, express.bodyParser() was
//deprecated in favor of a separate 'body-parser' module.
app.use(bodyParser.urlencoded({ extended: true })); 

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
app.post("/login", function(req, res){

	res.sendFile(path.join(__dirname + '/login.html'))

});

// The end-point for creating an account
app.post("/create", function(req, res){


	
});



app.listen(3000);
