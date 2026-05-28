import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { IdempotencyService } from '../services/idempotency.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotencyService: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['idempotency-key'];
    const userId = request.user?.id;

    if (!idempotencyKey || !userId) {
      return next.handle();
    }

    return from(
      this.idempotencyService.checkIdempotency(
        idempotencyKey,
        userId,
        request.body,
      ),
    ).pipe(
      switchMap((cachedResponse) => {
        if (cachedResponse) {
          return of(cachedResponse.body).pipe(
            tap((body) => {
              const response = context.switchToHttp().getResponse();
              response.status(cachedResponse.statusCode).json(body);
            }),
          );
        }

        return next.handle().pipe(
          tap((responseData) => {
            const response = context.switchToHttp().getResponse();
            this.idempotencyService.storeIdempotency(
              idempotencyKey,
              userId,
              request.route?.path || request.url,
              request.body,
              response.statusCode,
              responseData,
            );
          }),
          catchError((error) => throwError(() => error)),
        );
      }),
      catchError((error) => {
        if (error['code'] === 'IDEMPOTENCY_KEY_CONFLICT') {
          return throwError(() => new ConflictException(error.message));
        }
        return throwError(() => error);
      }),
    );
  }
}
