import { Router, Request, Response } from 'express';
import Logger from '../utils/logger';
import Book, { IBook } from '../models/Book';
const router = Router();
const logger = Logger('books-handler')


router.get('/', async (req: Request, res: Response) => {
    try {
        logger.debug(`New get books request`);
        let books = await Book.find({});
        res.status(200).json(books);
    }
    catch (error) {
        logger.error(`Error fetching books: ${error.toString()}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        logger.debug(`New get book request`);
        let id = req.params.id;
        if (!id) res.status(400).json({ error: `No ID specified` });
        else {
            let book = await Book.findOne({ _id: id });
            if (book) res.status(200).json(book);
            else res.status(404).json({ error: `No book with ID ${id}` });
        }
    }
    catch (error) {
        logger.error(`Error fetching book: ${error.toString()}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        logger.info(`New create book request`);
        let book: IBook = req.body;
        if (!book.name || !book.author || !book.published) res.status(400).json({ error: `Bad Request` });
        else {
            let created = await Book.create({ ...book });
            res.status(200).json(created)
        }
    }
    catch (error) {
        logger.error(`Error creating book: ${error.toString()}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        logger.info(`New create book request`);
        let id = req.params.id;
        if (!id) res.status(400).json({ error: `No ID specified` });
        else {
            let book: IBook = req.body;
            let updated = await Book.findOneAndUpdate({ _id: id }, { ...book }, { new: true });
            res.status(200).json(updated)
        }
    }
    catch (error) {
        logger.error(`Error creating book: ${error.toString()}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        logger.info(`New delete book request`);
        let id = req.params.id;
        if (!id) res.status(400).json({ error: `No ID specified` });
        else {
            let deleted = await Book.deleteOne({ _id: id });
            res.status(200).json({ message: 'OK' })
        }
    }
    catch (error) {
        logger.error(`Error creating book: ${error.toString()}`);
        res.status(500).json({ error: `Internal Server Error` });
    }
});

export default router;