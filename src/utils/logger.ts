const { createLogger, format, transports } = require('winston');
const colors = require('colors');
const environment = process.env.NODE_ENV;

var custom_format = function (name: string) {
    return format.combine(
        format.simple(),
        format.timestamp(),
        format.label({ label: colors.yellow('[books-recs-service]'.bold) }),
        format.colorize(),
        format.printf(info => `[${colors.grey(info.timestamp)}] ${info.label} ${info.level} : ${name.padEnd(25, '-')} :: ${info.message}`)
    );
}

var Dev_Logger = function (name) {
    return createLogger({
        format: custom_format(name),
        transports: [
            new transports.Console({
                level: "debug"
            })
        ]
    });
}

var Prod_Logger = function (name) {
    return createLogger({
        format: custom_format(name),
        transports: [
            new transports.File({
                maxsize: 5120000,
                maxFiles: 5,
                zippedArchive: true,
                tailable: true,
                filename: `${__dirname}/../../logs/books-recs-service.log`,
            }),
        ]
    });
}

var Test_Logger = function (name) {
    return createLogger({
        format: custom_format(name),
        transports: [
            new transports.Console({
                level: "debug",
                silent: true
            })
        ]
    });
}

let Logger;

if (environment === "production") {
    Logger = Prod_Logger;
}
else if (environment === "test") {
    Logger = Test_Logger;
}
else {
    Logger = Dev_Logger;
}
export default Logger;

