# CPSC-455 
## Group Members:
Manuel Perez - mperez5891@csu.fullerton.edu

Henry Torres - htorres15@csu.fullerton.edu

Fransisco Ramirez - cisco95@csu.fullerton.edu

Miguel Pulido - miguelpulidojr@csu.fullerton.edu 

Samantha Ibasitas - samanthaibasitas@csu.fullerton.edu

Steven Pham - 17phamsteven@csu.fullerton.edu

Jonathan Poh - jpoh@csu.fullerton.edu

## How to execute program:

Open terminal in project directory. 
Run command: “bash populateDB.txt” to set up database with a few test accounts. 
Run command: “node app.js”
Navigate to “http://localhost:3000” in browser. 

## Description of how the submission fulfills each of the outlined requirements. 

We have a front-end that: 
Allows customers to register using first name, last name, password (with enforced criteria), and address. 
Allows existing users to log in with username and password and remain logged in for 3 minutes at a time using sessions. 
Allows users to create multiple bank accounts and manage them all from the same logged in session. The management of these accounts includes viewing account balance, depositing and withdrawing money, and transferring money between accounts within the same user account.
Allows users to log out. 
Includes functionality for front-end data validation. 

We have a backend that:
Contains a database of all registered users and their account information.
Cookies that allow users to remain logged in for 3 minutes, and will reset the amount of time after an action is taken by the user. 
Includes CSP headers, HTTP-only cookies, and query escaping. 



– Anything special about your submission that we should take note of.

