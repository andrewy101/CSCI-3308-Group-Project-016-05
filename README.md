# CSCI-3308-Group-Project-016-05
Final project

## Brief Application Description
BudgetBeam is a web application that allows users to track their expenses with ease. BudgetBeam includes login and registration functionality, as well as basic user profile settings including the ability to change usernames/passwords and delete accounts, it also allows users to create and delete individual receipts for their expenses and categorize them, and users can generate expense reports for a month of their choosing and generate a PDF of this report if they wish. BudgetBeam aggregates all of this expense data into a neat, organized homepage showing monthly expense data and a dynamic pie chart, allowing users to budget for specific categories if they wish to do so.

## Contributors
- Andrew Yang
- Patrick Hunt
- Michael Thomas
- Julie Huang

## Technology Stack
- PostgreSQL
- Docker
- NodeJS
- ExpressJS

## Prerequisites to run the application
- Docker
- NodeJS and npm (node package manager)
- PostgreSQL Database

## How to run locally
First, clone the repository and confirm that all prerequisites are up to date.

Then, from the root directory of the repository, navigate to the src folder: 
```bash
cd '.\All Project code\components\src\'
```
Be sure that the '.env' file exists in the 'src' folder and is configured properly.

Run the following command:
```bash
docker compose up
``` 
The mocha/chai test cases will run automatically. Wait until they are finished.  

Once the message 'Database connection successful' is displayed in the terminal, open your browser and navigate to the URL below to view the web application:
```bash
http://localhost:3000/
```
Be sure that the following command is run if you are restarting the project after closing the docker container to reset the DB: 
```bash
docker compose down --volumes
```
## How to run tests
To explicitly run the Mocha/Chai test cases without starting the web application, navigate to the src folder of the repository, and locate the 'package.json' file. 
```bash
cd '.\All Project code\components\src\'
```
In 'package.json', locate "scripts", and modify the following line: 
```bash
"testandrun": "npm run prestart && npm run test && npm start"
```
To this:
```bash
"testandrun": "npm run test"
```
Save your changes, and then run the application with the following command:
```bash
docker compose up
```
This will explicitly run the Mocha/Chai test cases without starting the web application. If you wish to both run the tests and start the web application, keep the default configuration in "scripts" in 'package.json' as shown below:
```bash
"testandrun": "npm run prestart && npm run test && npm start"
```

## Link to deployed application
```bash
http://recitation-16-team-05.eastus.cloudapp.azure.com:3000/
```
