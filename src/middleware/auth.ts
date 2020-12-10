import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';
import jwt from "jsonwebtoken";
import Client, { IClient } from '../models/Client';
const logger = Logger('Auth Middlware');


export function basic_auth(req: Request, res: Response, next: NextFunction) {
    try {
        const authorization = req.headers.authorization;
        let token;
        logger.debug(`Authenticating new request...`);
        if (authorization) {
            token = authorization.split(" ")[1];
            if (token) {
                let decoded = Buffer.from(token, 'base64').toString('ascii').split(':');
                let client_id = decoded[0];
                let client_secret = decoded[1];
                logger.debug(`Decoded client_id: ${client_id}`);
                Client.findOne({
                    client_id: client_id
                }).then(client => {
                    if (client) {
                        req["currentClient"] = client;
                        if (new Date() > client.expires) {
                            res.status(401).json({ error: `Client has expired. Please create a new client.` })
                        }
                        else if (client.isValidSecret(client_secret)) {
                            next();
                        }
                        else res.status(401).json({ error: "Unauthorized request: Client ID or Secret incorrect" })

                    } else {
                        res.status(401).json({ error: "Unauthorized request: Client ID or Secret incorrect" })
                    }
                });
            }
            else {
                logger.warn(`Unauthorized request: No authorization token found.`);
                res.status(401).json({ error: "Unauthorized request. No authorization token found." });
            }
        }
        else {
            logger.warn(`Unauthorized request: No authorization header found.`);
            res.status(401).json({ error: "Unauthorized request. No authorization header found." });
        }
    }
    catch (err) {
        logger.error(`Error authenticating client: ${err.toString()}`)
        res.status(500).json({ error: `Internal Server Error` })
    }
}

export function bearer_auth(req: Request, res: Response, next: NextFunction) {
    try {
        const authorization = req.headers.authorization; // get the auth header value
        let token;
        logger.debug(`Authenticating new request...`);
        if (authorization) { // if there is an auth header value
            token = authorization.split(" ")[1]; // get the 2nd piece of the header value after the space ie "Bearer <TOKEN>"
            if (token) {
                jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                    if (err) { // if the decoding of the token throws an error, its a bad token, and we cannot authenticate this request.
                        res.status(401).json({ error: "Invalid token" });
                    } else {
                        if (Date.now() > decoded.token_expires) { // check if the token has expired (older than the access token lifetime). if it has, we cannot authenticate this request.
                            res.status(401).json({ error: `Token expired. Please retrieve a new access token.` })
                        }
                        else {
                            Client.findOne({ client_id: decoded.client_id }).then(client => { // otherwise, use the decoded token's client_id value to check for a valid client in the DB
                                if (client) { // if a client does exist...
                                    if (new Date() > client.expires) { // check if the client itself has expired
                                        res.status(401).json({ error: `Client has expired. Please create a new client.` })
                                    }
                                    else { // if not, everything is ok and we can authenticate this request.
                                        req["currentClient"] = client;
                                        next();
                                    }
                                }
                                else { // if a client does not exist, we cannot authenticate this request
                                    res.status(401).json({ error: `Invalid token` })
                                }
                            });
                        }
                    }
                });
            }
            else {
                logger.warn(`Unauthorized request: No authorization token found.`);
                res.status(401).json({ error: "Unauthorized request. No authorization token found." });
            }
        }
        else { // otherwise, there is no auth header and we cannot authenicate this request.
            logger.warn(`Unauthorized request: No authorization header found.`);
            res.status(401).json({ error: "Unauthorized request. No authorization header found." });
        }
    }
    catch (err) {
        logger.error(`Error authenticating client: ${err.toString()}`)
        res.status(500).json({ error: `Internal Server Error` })
    }
}