# book-recs-service
A simple Typescript application to demonstrate some of my NodeJS/Typescript abilities and work into a DevOps workflow.

The following instructions are for building, cleaning, running, and testing the app on your local machine. This assumes you have the same version of Node that I have, and have installed dependencies locally.
### Build

Builds the Typescript application and places in the `./build` directory

`npm run build`

### Clean

Simply removes all the contents of the `./build` directory in preparation for another build.

`npm run clean`

### Develop

Runs the Typescript application in development mode. Logs will print to the console.

`npm run dev`

### Test

Tests the Typescript application using mocha and chai. Will run all `*.spec.ts` files located in the `tests` directory.

`npm run test`

### Production

Runs the typescript application. Assumes build command has been completed successfully.

`npm run prod`

## Docker

Alternatively, you can use Docker to make development and production builds. Make sure you are in the project's root directory for building the image. The production iamge uses a multistage build to make the production container lighter.

### Development

#### Build an image for development

`docker build -f ./Dockerfile.dev -t book-recs-service:dev .`

#### Run that image for development

`docker run -p 3002:3002 -v /path/to/local/book-recs-service:/usr/src/book-recs-service -d book-recs-service:dev`

### Production

#### Build an image for production

`docker build -f ./Dockerfile -t book-recs-service:production .`

#### Create container from image for production

`docker run --name book-recs-service -p 3002:3002 -d book-recs-service:production`