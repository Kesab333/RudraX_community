import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from "@nestjs/common";
import { Observable, TimeoutError, throwError } from "rxjs";
import { catchError, timeout } from "rxjs/operators";
import { readAppEnv } from "../config/app-env";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const env = readAppEnv();

    return next.handle().pipe(
      timeout(env.httpTimeoutMs),
      catchError((error: unknown) => {
        if (error instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException("Request timed out"));
        }

        return throwError(() => error);
      }),
    );
  }
}
