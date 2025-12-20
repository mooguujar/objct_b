import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseDto } from '../dto/response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 500;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        
        // 处理验证错误
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
        }
      } else {
        message = exception.message;
      }

      code = status;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `未处理的异常: ${exception.message}`,
        exception.stack,
        `${request.method} ${request.url}`,
      );
    }

    const errorResponse = ResponseDto.error(code, message);

    response.status(status).json(errorResponse);
  }
}

