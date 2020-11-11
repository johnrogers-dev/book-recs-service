import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import recommendations from "./routes/recommendations";
import Logger from "./utils/logger";

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

      logger.info(`Configuring middleware...`);
      this.app.use(bodyParser.urlencoded({ extended: true }));
      this.app.use(bodyParser.json());
      logger.info(`Middleware configured.`);
      this.routes();
    } catch (error) {
      logger.error(`Error configuring middleware: ${error.toString()}`);
    }
  }

  public routes(): void {
    try {
      logger.info(`Configuring routes...`);

      this.app.use("/recommendations", recommendations);

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
