import chai from 'chai';
import chaihttp from 'chai-http';
import 'mocha';
import { exit } from 'process';
const should = chai.should();
const expect = chai.expect;

chai.use(chaihttp);

import app from '../../src/Server';

const test_client_id = "thisistheclientid";
const test_client_secret = "thisistheclientsecret"

describe('Test /books', () => {
    let token;
    let createdBook;
    before(function (done) {
        this.timeout(0); // disable Mocha timeouts to give enough time for server to start
        new Promise(resolve => setTimeout(resolve, 3000)).then(() => {
            chai
                .request(app)
                .post('/oauth2/v1/token')
                .set('authorization', `Basic ${Buffer.from(`${test_client_id}:${test_client_secret}`).toString('base64')}`)
                .send({
                    'grant_type': 'client_credentials'
                })
                .end((err, res) => {
                    token = res.body.access_token;
                    done();
                });
        })
    });
    after(function () {
        // exit(0);
    })
    it('Should create book', done => {
        chai
            .request(app)
            .post('/books')
            .set('authorization', `Bearer ${token}`)
            .send({
                "name": "Test Book Name",
                "author": "Test Author Name",
                "genre": "Test Genre",
                "published": new Date(),
                "pages": 100,
                "isbn": "ISBN 123-12345-123-1"
            })
            .end((err, res) => {
                res.should.have.status(200);
                expect(res).to.be.json;
                expect(res.body.name).to.eql("Test Book Name")
                createdBook = res.body;
                done();
            });
    });
    it('Should return all books', done => {
        chai
            .request(app)
            .get('/books')
            .set('authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                expect(res.body).to.be.an('array')
                done();
            });
    });
    it('Should return book by id', done => {
        chai
            .request(app)
            .get(`/books/${createdBook._id}`)
            .set('authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
    it('Should update book by id', done => {
        chai
            .request(app)
            .put(`/books/${createdBook._id}`)
            .set('authorization', `Bearer ${token}`)
            .send({
                "name": "Updated Test Book"
            })
            .end((err, res) => {
                res.should.have.status(200);
                expect(res.body.name).to.eql("Updated Test Book")
                done();
            });
    });
    it('Should delete book by id', done => {
        chai
            .request(app)
            .delete(`/books/${createdBook._id}`)
            .set('authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                chai
                    .request(app)
                    .get(`/books/${createdBook._id}`)
                    .set('authorization', `Bearer ${token}`)
                    .end((err, dres) => {
                        dres.should.have.status(404);
                        done();
                    });
            });
    });
    it('Should return 404', done => {
        chai
            .request(app)
            .get('/does/not/exist')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });

});