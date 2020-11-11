import { Router, Request, Response } from 'express';
import Logger from '../utils/logger';

const router = Router();
const logger = Logger('flexls-handler')

const recommendations_db = [
    {
        "id": "000",
        "name": "All Quiet on the Western Front",
        "author": "Erich Maria Remarque",
        "published": "January 29, 1929"
    },
    {
        "id": "001",
        "name": "A Sand County Almanac",
        "author": "Aldo Leopold",
        "published": "1949"
    },
    {
        "id": "002",
        "name": "A River Runs Through It",
        "author": "Norman Maclean",
        "published": "May 1976"
    }
];

router.get('/', async (req: Request, res: Response) => {
    try {
        logger.info(`New get recommendations request`);
        res.status(200).json(recommendations_db);
    }
    catch (error) {
        logger.error(`Error fetching recommendation: ${error.toString()}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        logger.info(`New get recommendation request`);
        let id = req.params.id;
        if (!id) res.status(400).json({ error: `No ID specified` });
        let found = recommendations_db.find(ele => ele.id === id);
        if (found) res.status(200).json(found);
        else res.status(404).json({ error: `No recommendation with ID.` });

    }
    catch (error) {
        logger.error(`Error fetching recommendation: ${error.toString()}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

router.get('/random/book', async (req: Request, res: Response) => {
    try {
        logger.info(`New get random recommendation request`);
        let rnd = Math.floor(Math.random() * Math.floor(recommendations_db.length))
        res.status(200).json(recommendations_db[rnd]);
    }
    catch (error) {
        logger.error(`Error fetching recommendation: ${error.toString()}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

export default router;