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

describe('Test /oauth2', () => {
    before(function (done) {
        this.timeout(0); // disable Mocha timeouts to give enough time for server to start
        new Promise(resolve => setTimeout(resolve, 3000)).then(() => {
            done();
        })
    });
    after(function () {
        // exit(0);
    });
    it('Should return an access token', done => {
        chai
            .request(app)
            .post('/oauth2/v1/token')
            .set('authorization', `Basic ${Buffer.from(`${test_client_id}:${test_client_secret}`).toString('base64')}`)
            .send({
                'grant_type': 'client_credentials'
            })
            .end((err, res) => {
                expect(res).to.be.json;
                expect(res.body.access_token).to.be.a("string");
                expect(res.body.expires_in).to.be.a("number");
                expect(res.body.token_type).to.be.a("string");
                expect(res.body.scope).to.be.a("string");
                expect(res.body.token_type).to.equal("Bearer")
                done();
            })
    });
    it('Should return a 400 with missing grant_type', done => {
        chai
            .request(app)
            .post('/oauth2/v1/token')
            .set('authorization', `Basic ${Buffer.from(`${test_client_id}:${test_client_secret}`).toString('base64')}`)
            .end((err, res) => {
                res.should.have.status(400);
                expect(res.body.error).to.equal('You did not supply a valid grant type. Currently on client_credentials are supported.')
                done();
            })
    });

});