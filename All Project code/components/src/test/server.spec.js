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

describe('Login Input Validation', () => {


  it('positive : /login', done => {
    chai
      .request(server)
      .post('/login')
      .send({username:'username', password: 'password'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.include('Homepage');
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
  


