# book-recs-service
A simple Typescript application to work into a DevOps workflow

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