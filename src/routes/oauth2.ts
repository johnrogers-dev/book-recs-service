import { Router, Request, Response } from 'express';
import Logger from '../utils/logger';
import Client from '../models/Client';

const router = Router();
const logger = Logger('auth-handler');


router.post('/v1/token', async (req: Request, res: Response) => {
    try {
        logger.debug(`New token request`);
        let body = req.body;
        if (body.grant_type === "client_credentials") {
            let currentClient = req["currentClient"];
            let client = await Client.findOne({ _id: currentClient._id });
            let token = client.generateJWT();
            res.status(200).json({
                access_token: token,
                expires_in: parseInt(process.env.ACCESS_TOKEN_LIFETIME),
                token_type: "Bearer",
                scope: "default"
            });
        }
        else {
            logger.warn(`auth endpoint not supplied valid grant_type`);
            res.status(400).json({ error: `You did not supply a valid grant type. Currently on client_credentials are supported.` })
        }
    }
    catch (error) {
        logger.error(`Error token endpoint: ${error.toString()}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

export default router;