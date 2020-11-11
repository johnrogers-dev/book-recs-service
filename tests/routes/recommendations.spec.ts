import chai from 'chai';
import chaihttp from 'chai-http';
import 'mocha';
import { exit } from 'process';
const should = chai.should();
const expect = chai.expect;

chai.use(chaihttp);

import app from '../../src/Server';


describe('Test /recommendations', () => {
    before(function (done) {
        new Promise(resolve => setTimeout(resolve, 1500)).then(() => {
            done();
        })
    });
    after(function () {
        exit(0);
    })
    it('Should return all recommendations', done => {
        chai
            .request(app)
            .get('/recommendations')
            .end((err, res) => {
                res.should.have.status(200);
                expect(res.body).to.be.an('array')
                done();
            });
    });
    it('Should return recommendation by id', done => {
        chai
            .request(app)
            .get(`/recommendations/001`)
            .end((err, res) => {
                res.should.have.status(200);
                expect(res.body.name).to.eql("A Sand County Almanac")
                done();
            });
    });
    it('Should return 404 not found', done => {
        chai
            .request(app)
            .get(`/recommendations/doesnotexistID`)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
    it('Should return random recommendation', done => {
        chai
            .request(app)
            .get(`/recommendations/random/book`)
            .end((err, res) => {
                res.should.have.status(200);
                expect(res.body.name).to.be.a("string")
                done();
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