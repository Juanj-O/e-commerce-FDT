/**
 * Railway Oriented Programming - Result Type
 * Used for functional error handling without exceptions
 */

export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from a failed result');
    }
    return this._value as T;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from a successful result');
    }
    return this._error as E;
  }

  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure) {
      return Result.fail<U, E>(this._error as E);
    }
    return Result.ok<U, E>(fn(this._value as T));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure) {
      return Result.fail<U, E>(this._error as E);
    }
    return fn(this._value as T);
  }

  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isSuccess) {
      return Result.ok<T, F>(this._value as T);
    }
    return Result.fail<T, F>(fn(this._error as E));
  }

  getOrElse(defaultValue: T): T {
    return this.isSuccess ? (this._value as T) : defaultValue;
  }

  getOrThrow(): T {
    if (this.isFailure) {
      throw this._error;
    }
    return this._value as T;
  }

  match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    return this.isSuccess
      ? onSuccess(this._value as T)
      : onFailure(this._error as E);
  }
}

// Helper functions for chaining operations
export const pipe = <T, E>(
  initial: Result<T, E>,
  ...fns: Array<(value: T) => Result<T, E>>
): Result<T, E> => {
  return fns.reduce(
    (result, fn) => (result.isSuccess ? fn(result.value) : result),
    initial,
  );
};

export const combine = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const values: T[] = [];
  for (const result of results) {
    if (result.isFailure) {
      return Result.fail<T[], E>(result.error);
    }
    values.push(result.value);
  }
  return Result.ok<T[], E>(values);
};
