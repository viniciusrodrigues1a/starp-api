import path from "path";
import winston from "winston";
import fs from "fs";

const logDIR = path.resolve(__dirname, "..", "..", "logs");

if (!fs.existsSync(logDIR)) {
  fs.mkdirSync(logDIR);
}

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const customFormat = winston.format.printf(({ level, message }) => {
  return `\u001b[35m${level.toUpperCase()}\x1b[0m: ${JSON.stringify(message)}`;
});

function makeLogger(level: string, filename: string): winston.Logger {
  const l = winston.createLogger({
    format: logFormat,
    transports: [
      new winston.transports.File({
        filename: `${logDIR}/${filename}`,
        level,
      }),
    ],
  });

  if (process.env.NODE_ENV !== "production") {
    l.add(
      new winston.transports.Console({
        format: winston.format.combine(customFormat),
        level: "debug",
      })
    );
  }

  return l;
}

const _error = makeLogger("error", "error.log");
const _debug = makeLogger("debug", "combined.log");

export const logger = {
  error: (msg: any) => _error.error(msg),
  warn: (msg: any) => _debug.warn(msg),
  info: (msg: any) => _debug.info(msg),
  http: (msg: any) => _debug.http(msg),
  verbose: (msg: any) => _debug.verbose(msg),
  debug: (msg: any) => _debug.debug(msg),
  waitOnFinish: (cb: any) => {
    _debug.on("finish", () => _error.on("finish", cb));
  },
};

const exceptionLogger = makeLogger("info", "exceptions.log");
exceptionLogger.exceptions.handle(
  new winston.transports.File({ filename: `${logDIR}/exceptions.log` })
);
