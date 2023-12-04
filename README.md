# CSCI-3308-Group-Project-016-05
Final project

Brief Application Description:
BudgetBeam is a web application that allows users to track their monthly expenses. BudgetBeam utilizes NodeJS, EJS, and PostgreSQL to provide visuals and an expense report to ensure that users are staying within their budget so as to ensure proper financial management.

Contributors:
Andrew Yang, Patrick Hunt, Michael Thomas, Julie Huang

Technology Stack: PostgreSQL, Docker, NodeJS, ExpressJS

Prerequisites to run the application:
- Docker
- NodeJS and npm (node package manager)
- PostgreSQL Database

How to run locally:
- Clone the repository
- Confirm all prerequisites are up to date
- Navigate to the src folder ('REPO\All Project code\components\src')
- Be sure that the '.env' file exists and is configured
- Run the command 'docker compose up' 
- The mocha/chai test cases will run automatically. Wait until they are finished.
- Once the message 'Database connection successful' is displayed in the terminal, open your browser and navigate to 'http://localhost:3000/' to view the web application.
- Be sure that the command 'docker compose down --volumes' is run if you are restarting the project after closing the docker container to reset the DB.
