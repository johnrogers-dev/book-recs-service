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

describe('Test /recommendations', () => {
    let token;
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
                })

        })
    });
    after(function () {
        // exit(0);
    });
    it('Should return an empty array', done => {
        let querystring = `?genre=doesntexist`
        chai
            .request(app)
            .get('/recommendations' + querystring)
            .set('authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                expect(res).to.be.json;
                expect(Object.keys(res.body).length).to.eq(0)
                done();
            });
    });
    it('Should return a valid recommendation', done => {
        let querystring = `?genre=War`
        chai
            .request(app)
            .get('/recommendations' + querystring)
            .set('authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                expect(res).to.be.json;
                expect(res.body.name).to.be.a("string")
                done();
            });
    });
});