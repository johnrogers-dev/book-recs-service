import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import compression from 'compression';
import oauth2 from "./routes/oauth2";
import recommendations from "./routes/recommendations";
import books from "./routes/books";
import Logger from "./utils/logger";
import { basic_auth, bearer_auth } from './middleware/auth';
import { all_user_limit, per_user_limit } from './middleware/rate_limiter';

const logger = Logger('Server')
class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    dotenv.config();
    this.config();
  }

  public async config(): Promise<void> {
    try {
      logger.info(`Node Environment: ${process.env.NODE_ENV}`);
      logger.info(`Connecting to MongoDB...`);
      await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
      logger.info(`Successfully connected to MongoDB`);
      logger.info(`Configuring middleware...`);
      this.app.use(bodyParser.urlencoded({ extended: true }));
      this.app.use(bodyParser.json());
      this.app.use(compression());
      logger.info(`Middleware configured.`);
      this.routes();
    } catch (error) {
      logger.error(`Error configuring middleware: ${error.toString()}`);
    }
  }

  public routes(): void {
    try {
      logger.info(`Configuring routes...`);
      this.app.use("/oauth2", basic_auth, all_user_limit, oauth2);
      this.app.use("/recommendations", bearer_auth, all_user_limit, per_user_limit, recommendations);
      this.app.use("/books", bearer_auth, all_user_limit, per_user_limit, books);
      // this should always be last
      this.app.use((req, res, next) => {
        logger.http(`Request Path Not found: ${req.path} `)
        res.status(404).json({ error: "Not Found" })
      });
      logger.info(`Routes configured.`);
    } catch (err) {
      logger.error(`Error configuring routes: ${err.toString()}`);
    }
  }
}

export default new Server().app;
