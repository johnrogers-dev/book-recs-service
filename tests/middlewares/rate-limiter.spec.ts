import chai from 'chai';
import chaihttp from 'chai-http';
import { Request } from 'express';
import 'mocha';
import { exit } from 'process';
const should = chai.should();
const expect = chai.expect;

chai.use(chaihttp);

import app from '../../src/Server';


describe('Test /recommendations', () => {
    before(function (done) {
        let r = Request
    });
    after(function () {
        exit(0);
    })
    it('Should return all recommendations', done => {

    });
});