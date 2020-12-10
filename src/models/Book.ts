import mongoose from 'mongoose';

export interface IBook extends mongoose.Document {
    _id: string;
    name: string
    author: string;
    published: Date;
    pages: number;
    genre: string;
    isbn: string;
};

const bookSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        author: { type: String, required: true },
        published: { type: Date, required: true },
        pages: { type: Number, required: true },
        genre: { type: String, required: true },
        isbn: { type: String, required: true }
    },
    { timestamps: true }
);

export default mongoose.model<IBook>("Book", bookSchema);

