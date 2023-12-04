// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
      
    });
  })
  // ===========================================================================
  // TO-DO: Part A Login unit test case
var Cookies;
describe('Login Input Validation', () => {


  it('positive : /login', done => {
    chai
      .request(server)
      .post('/login')
      .redirects(0)
      .send({username:'username', password: 'password'})
      .end((err, res) => {
        expect('Location', '/home?login=true');
        expect(res).to.have.status(302);
        expect(res).to.have.header("set-cookie");
        Cookies = res.headers['set-cookie'];
        done();
      });
      
      
    });
  
    it('Negative : /login. Checking invalid name', done => {
      chai
        .request(server)
        .post('/login')
        .send({username: 'username', password:'wrong_pass123'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include('Incorrect username or password.');
          done();
        });
    });

  })


 //Test case for Expenses page
describe('Expense Page Input Validation', () => {
  it('Positive : /expenses/new', done => {
      chai
        .request(server)
        .post('/expenses/new')
        .set('Cookie', Cookies)
        .send({income: false, date: "2023-12-22", category: "Food", description: "Taco Bell", lineItems: [{name: "Gordita Crunch", amount: 6.20}, {name:"Baja Blast", amount: 4.40}], amount: 10.6})
        .end((err, res) => {

          expect(res).to.have.status(200);
          expect(res.ok).to.be.true;
          done();
        });
        
        
      });
  it('Negative : /expenses/new', done => {
    
    chai
      .request(server)
      .post('/expenses/new')
      .set('Cookie', Cookies)
      .send({income: false, date: "2023-12-22", category: "Food", description: "Taco Bell", lineItems: [], amount: 100})
      .end((err, res) => {
        expect(res).to.have.status(200);
        const url = res.request.url;
        const url_parse = new URL(url);
        const path = url_parse.pathname;

        //The path would just be '/expenses' if proper input was entered

        expect(path).to.equal('/expenses/new');
        done();
      });
      
      
    });
  
 })

 //Test case for generation of expense report
 describe('Expense Report Validation', () => {
  //Generates a report for a month that the user has expenses for
  it('Positive : /report', done => {
      chai
        .request(server)
        .get('/report?month=12')
        .set('Cookie', Cookies)
        .end((err, res) => {

          expect(res).to.have.status(200);
          expect(res.text).to.include('Monthly report for December');
          done();

        });     
      });

  //Tries to generate a report for a month that the user does not have expenses for
  it('Negative : /report', done => {
    
    chai
      .request(server)
      .get('/report?month=1')
      .set('Cookie', Cookies)
      .end((err, res) => {

        expect(res).to.have.status(200);
        expect(res.text).to.include('No data available for this month');

        
        done();

      });   
    });
 })

  //Part B test cases for /register endpoint
  describe('Register Input Validation', () => {

    it('positive : /register', done => {
      chai
        .request(server)
        .post('/register')
        .send({username:'username1234', password: 'password1234'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.include('Login');
          done();
        });
        
        
      });
  
    it('Negative : /register. Checking if username is taken', done => {
        chai
          .request(server)
          .post('/register')
          .send({username: 'username', password:'password'})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.text).to.include('Username taken!');
            done();
          });
      });

  })
  

