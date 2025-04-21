import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import Logging from 'library/Logging'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    //Getting the request log
    Logging.info(
      `Incomin -> Method [${req.method}] - URL [${req.originalUrl}] - Host: [${req.hostname}] - IP [${
        req.ip
      }] - Body [${JSON.stringify(req.body)}]`,
    )

    if (next) {
      next()
    }
  }
}
