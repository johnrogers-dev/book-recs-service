import { Router, Request, Response } from 'express';
import Logger from '../utils/logger';
import Book, { IBook } from '../models/Book';
const router = Router();
const logger = Logger('book-recs-handler')


router.get('/', async (req: Request, res: Response) => {
    try {
        logger.info(`New get recommendations request`);
        let query = req.query;
        let allBooksByQuery = await Book.find({ ...query });
        if (allBooksByQuery.length === 0) {
            res.status(200).json([]);
        }
        else {
            let i = Math.floor(Math.random() * Math.floor(allBooksByQuery.length));
            res.status(200).json(allBooksByQuery[i]);
        }
    }
    catch (error) {
        logger.error(`Error fetching recommendation: ${error.toString()}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

export default router;