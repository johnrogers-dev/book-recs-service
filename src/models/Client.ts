import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IClient extends mongoose.Document {
    _id: string;
    client_id: string
    client_secret: string;
    name: string;
    description: string;
    expires: Date;
    isValidSecret: Function;
    generateJWT: Function;
};

const clientSchema = new mongoose.Schema(
    {
        client_id: { type: String, required: true, unique: true },
        client_secret: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: false, default: null },
        expires: { type: Date, required: true }
    },
    { timestamps: true }
);

clientSchema.methods.setClientSecret = function setPassword(secret): void {
    this.client_secret = bcrypt.hashSync(secret, 10);
};

clientSchema.methods.isValidSecret = function isValidPassword(secret): boolean {
    return secret === this.client_secret//bcrypt.compareSync(secret, this.client_secret);
};

clientSchema.methods.generateJWT = function generateJWT(pwd = '') {
    return jwt.sign(
        {
            client_id: this.client_id,
            name: this.name,
            description: this.description,
            token_expires: Date.now() + (1000 * parseInt(process.env.ACCESS_TOKEN_LIFETIME))
        },
        process.env.JWT_SECRET
    );
};

export default mongoose.model<IClient>("Client", clientSchema);

