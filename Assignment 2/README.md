# CPSC-455 
## Group Members:
Manuel Perez - mperez5891@csu.fullerton.edu

Henry Torres - htorres15@csu.fullerton.edu

Fransisco Ramirez - cisco95@csu.fullerton.edu

Miguel Pulido - miguelpulidojr@csu.fullerton.edu 

Samantha Ibasitas - samanthaibasitas@csu.fullerton.edu

Steven Pham - 17phamsteven@csu.fullerton.edu

Jonathan Poh - jpoh@csu.fullerton.edu

## Project Description: 

This project uses secure coding practices to develop and deploy a web based application simulating bank account transactions. By using secure coding practices, this application is secure or at the very least mitigates cross-site scripting (XSS) attacks and broken authentication attacks. Additionally, this application guards against SQL injection attacks.

## How to execute program:

Open terminal in project directory. 
- Run command: “bash populateDB.txt” to set up database with a few test accounts. 
- Run command: “node app.js”
- Navigate to “http://localhost:3000” in browser. 

## Description of how the submission fulfills each of the outlined requirements. 

We have a front-end that: 
- Allows customers to register using first name, last name, password (with enforced criteria), and address. 
- Allows existing users to log in with username and password and remain logged in for 3 minutes at a time using sessions. 
- Allows users to create multiple bank accounts and manage them all from the same logged in session. The management of these accounts includes viewing account balance, depositing and withdrawing money, and transferring money between accounts within the same user account.
- Allows users to log out. 
- Includes functionality for front-end data validation. 

We have a backend that:
- Contains a database of all registered users and their account information.
- Cookies that allow users to remain logged in for 3 minutes, and will reset the amount of time after an action is taken by the user. 
- Includes CSP headers, HTTP-only cookies, and query escaping. 
- Serialization is included
- No xss-filters needed because of how our data gets passed to the backend.



## Anything special about your submission that we should take note of.
Requires the following to be installed: 
- Express: npm install express --save
- Client-sessions: npm install client-sessions
- Mysql2: npm install --save mysql2
- Body-parser: npm install body-parser
- Path: npm install --save path
- xss-filters: npm install xss-filters --save
- csp: npm i helmet-csp

## Functionalities: 

This web application allows users to create an account, login, create one or more bank accounts, deposit money, withdraw money, transfer money between accounts, and log out. Users are authenticated and can only access their own accounts with proper credentials. Users are forbidden from accessing the accounts of other users due to authentication. This helps mitigate broken access control issues. The API endpoint is only accessible to authenticated users and the only information available is the authenticated user’s information. Authentication is necessary for each individual user to view, update, and manage their own accounts. Session cookies will log users out if there is a prolonged period of inactivity of 3 minutes. An HttpOnly cookie is used to prevent the client side from obtaining cookie information. Only the server is able to access cookie information. Content Security Policy provided Helmet helps detect and mitigate XSS attacks. The javascript is written in strict mode, which is helpful in identifying errors that could compromise the application. This application is free of document object models and thus will avoid DOM XSS attacks.

## Pre-requisites: 

Node.js Node package manager Express.js Filestream Client-sessions Helmet MySQL - The DB_Instructions.txt document details installing MySQL with the mariaDB server

## Application Set-Up: 

This application uses node.js is a runtime environment for both front-end and back-end development. The languages used are javascript and html. The front-end has validation to help users enter the appropriate information and help mitigate attacks. Input fields have certain restrictions. During account creation, the username is restricted to 15 characters max and a strong password is required. The password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and be 8 characters long. When typing in the password to login, the password entered is hidden from the user. The inputs in the results page are restricted. The accounts that are selected are chosen from an options list that is populated by values pulled from the database. The user must pick from the list provided in the drop down list. Submission of numeric values pertaining to deposit, withdrawal, transfer, bank account are validated with the help of html input tag. The amount entered for deposit, withdrawal, transfer and create are limited to numbers with two decimal places, values greater than or equal to 0.01. The max amounts change. Input values are submitted by a POST request. This POST request helps keep the JSON data from being seen in the URL.

The data itself goes through to a MySql database. The values entered are checked against the database. A json object is created, sanitized by escaping the “<”> with \003u. An API endpoint will have been completed and the API is only accessible to the logged in user. The information stored in the API is only that of the authorized customer. The data contained in the API is user specific. The API is called by a script executing in the html document.

The MySql database helps validate, and the values pushed into the html body have been either validated or sanitized. The MySql queries have been written in a parameterized form. This helps prevent direct injection attacks.
