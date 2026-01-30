import { Result, pipe, combine } from './result';

describe('Result', () => {
  describe('static constructors', () => {
    describe('Result.ok', () => {
      it('should create a successful result with the given value', () => {
        const result = Result.ok<number>(42);
        expect(result.isSuccess).toBe(true);
        expect(result.isFailure).toBe(false);
        expect(result.value).toBe(42);
      });

      it('should create a successful result with a string value', () => {
        const result = Result.ok<string>('hello');
        expect(result.value).toBe('hello');
      });

      it('should create a successful result with a null value', () => {
        const result = Result.ok<null>(null);
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBeNull();
      });

      it('should create a successful result with an undefined value', () => {
        const result = Result.ok<undefined>(undefined);
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBeUndefined();
      });

      it('should create a successful result with an object value', () => {
        const obj = { name: 'test', count: 5 };
        const result = Result.ok(obj);
        expect(result.value).toEqual(obj);
      });

      it('should create a successful result with an array value', () => {
        const arr = [1, 2, 3];
        const result = Result.ok(arr);
        expect(result.value).toEqual(arr);
      });
    });

    describe('Result.fail', () => {
      it('should create a failed result with the given error', () => {
        const error = new Error('something went wrong');
        const result = Result.fail<number>(error);
        expect(result.isSuccess).toBe(false);
        expect(result.isFailure).toBe(true);
        expect(result.error).toBe(error);
      });

      it('should create a failed result with a string error', () => {
        const result = Result.fail<number, string>('error message');
        expect(result.isFailure).toBe(true);
        expect(result.error).toBe('error message');
      });

      it('should create a failed result with a custom error object', () => {
        const customError = { code: 'NOT_FOUND', message: 'Item not found' };
        const result = Result.fail<string, typeof customError>(customError);
        expect(result.error).toEqual(customError);
      });
    });
  });

  describe('isSuccess getter', () => {
    it('should return true for a successful result', () => {
      expect(Result.ok(1).isSuccess).toBe(true);
    });

    it('should return false for a failed result', () => {
      expect(Result.fail(new Error('fail')).isSuccess).toBe(false);
    });
  });

  describe('isFailure getter', () => {
    it('should return false for a successful result', () => {
      expect(Result.ok(1).isFailure).toBe(false);
    });

    it('should return true for a failed result', () => {
      expect(Result.fail(new Error('fail')).isFailure).toBe(true);
    });
  });

  describe('value getter', () => {
    it('should return the value for a successful result', () => {
      const result = Result.ok<string>('data');
      expect(result.value).toBe('data');
    });

    it('should throw an error when accessing value on a failed result', () => {
      const result = Result.fail<string>(new Error('failure'));
      expect(() => result.value).toThrow('Cannot get value from a failed result');
    });
  });

  describe('error getter', () => {
    it('should return the error for a failed result', () => {
      const error = new Error('oops');
      const result = Result.fail<string>(error);
      expect(result.error).toBe(error);
    });

    it('should throw an error when accessing error on a successful result', () => {
      const result = Result.ok<string>('data');
      expect(() => result.error).toThrow('Cannot get error from a successful result');
    });
  });

  describe('map', () => {
    it('should transform the value of a successful result', () => {
      const result = Result.ok<number>(5).map((x) => x * 2);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(10);
    });

    it('should transform value type via mapping', () => {
      const result = Result.ok<number>(42).map((x) => x.toString());
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('42');
    });

    it('should not execute the function on a failed result', () => {
      const fn = jest.fn((x: number) => x * 2);
      const result = Result.fail<number>(new Error('fail')).map(fn);
      expect(result.isFailure).toBe(true);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should preserve the error when mapping a failed result', () => {
      const error = new Error('original error');
      const result = Result.fail<number>(error).map((x) => x * 2);
      expect(result.error).toBe(error);
    });

    it('should support chaining multiple maps', () => {
      const result = Result.ok<number>(3)
        .map((x) => x + 1)
        .map((x) => x * 10)
        .map((x) => `Value: ${x}`);
      expect(result.value).toBe('Value: 40');
    });
  });

  describe('flatMap', () => {
    it('should chain successful results', () => {
      const result = Result.ok<number>(10).flatMap((x) =>
        x > 5 ? Result.ok(x * 2) : Result.fail(new Error('too small')),
      );
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(20);
    });

    it('should return failure when the inner function returns a failure', () => {
      const result = Result.ok<number>(3).flatMap((x) =>
        x > 5 ? Result.ok(x * 2) : Result.fail(new Error('too small')),
      );
      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('too small');
    });

    it('should not execute the function on a failed result', () => {
      const fn = jest.fn((_x: number) => Result.ok(99));
      const result = Result.fail<number>(new Error('fail')).flatMap(fn);
      expect(result.isFailure).toBe(true);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should preserve the original error when flatMapping a failed result', () => {
      const error = new Error('original');
      const result = Result.fail<number>(error).flatMap((x) => Result.ok(x));
      expect(result.error).toBe(error);
    });

    it('should support chaining multiple flatMaps', () => {
      const divide = (a: number, b: number): Result<number, Error> =>
        b === 0 ? Result.fail(new Error('division by zero')) : Result.ok(a / b);

      const result = Result.ok<number>(100)
        .flatMap((x) => divide(x, 2))
        .flatMap((x) => divide(x, 5));
      expect(result.value).toBe(10);
    });

    it('should short-circuit on first failure in a chain', () => {
      const divide = (a: number, b: number): Result<number, Error> =>
        b === 0 ? Result.fail(new Error('division by zero')) : Result.ok(a / b);

      const result = Result.ok<number>(100)
        .flatMap((x) => divide(x, 0))
        .flatMap((x) => divide(x, 5));
      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('division by zero');
    });
  });

  describe('mapError', () => {
    it('should transform the error of a failed result', () => {
      const result = Result.fail<number, string>('not found').mapError(
        (err) => ({ code: 404, message: err }),
      );
      expect(result.isFailure).toBe(true);
      expect(result.error).toEqual({ code: 404, message: 'not found' });
    });

    it('should not execute the function on a successful result', () => {
      const fn = jest.fn((err: string) => ({ code: 500, message: err }));
      const result = Result.ok<number, string>(42).mapError(fn);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(42);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should preserve the value when mapError is called on a successful result', () => {
      const result = Result.ok<string, string>('hello').mapError(
        (e) => new Error(e),
      );
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('hello');
    });
  });

  describe('getOrElse', () => {
    it('should return the value for a successful result', () => {
      const result = Result.ok<number>(42);
      expect(result.getOrElse(0)).toBe(42);
    });

    it('should return the default value for a failed result', () => {
      const result = Result.fail<number>(new Error('fail'));
      expect(result.getOrElse(0)).toBe(0);
    });

    it('should return the default string for a failed string result', () => {
      const result = Result.fail<string>(new Error('fail'));
      expect(result.getOrElse('default')).toBe('default');
    });

    it('should return the value even when it is falsy (0)', () => {
      const result = Result.ok<number>(0);
      expect(result.getOrElse(99)).toBe(0);
    });

    it('should return the value even when it is falsy (empty string)', () => {
      const result = Result.ok<string>('');
      expect(result.getOrElse('fallback')).toBe('');
    });

    it('should return the value even when it is falsy (false)', () => {
      const result = Result.ok<boolean>(false);
      expect(result.getOrElse(true)).toBe(false);
    });
  });

  describe('getOrThrow', () => {
    it('should return the value for a successful result', () => {
      const result = Result.ok<number>(42);
      expect(result.getOrThrow()).toBe(42);
    });

    it('should throw the error for a failed result', () => {
      const error = new Error('test error');
      const result = Result.fail<number>(error);
      expect(() => result.getOrThrow()).toThrow(error);
    });

    it('should throw a string error directly', () => {
      const result = Result.fail<number, string>('string error');
      expect(() => result.getOrThrow()).toThrow('string error');
    });
  });

  describe('match', () => {
    it('should call onSuccess for a successful result', () => {
      const result = Result.ok<number>(10);
      const output = result.match(
        (value) => `Success: ${value}`,
        (error) => `Error: ${error}`,
      );
      expect(output).toBe('Success: 10');
    });

    it('should call onFailure for a failed result', () => {
      const error = new Error('failure');
      const result = Result.fail<number>(error);
      const output = result.match(
        (value) => `Success: ${value}`,
        (err) => `Error: ${err.message}`,
      );
      expect(output).toBe('Error: failure');
    });

    it('should return the value from onSuccess callback', () => {
      const result = Result.ok<string>('data');
      const output = result.match(
        (v) => v.length,
        () => -1,
      );
      expect(output).toBe(4);
    });

    it('should return the value from onFailure callback', () => {
      const result = Result.fail<string>(new Error('oops'));
      const output = result.match(
        (v) => v.length,
        () => -1,
      );
      expect(output).toBe(-1);
    });

    it('should allow returning different types than the original value', () => {
      const result = Result.ok<number>(42);
      const output = result.match(
        (v) => ({ success: true, data: v }),
        (e) => ({ success: false, data: 0 }),
      );
      expect(output).toEqual({ success: true, data: 42 });
    });
  });
});

describe('pipe', () => {
  it('should apply functions sequentially on a successful initial result', () => {
    const add1 = (x: number) => Result.ok<number, Error>(x + 1);
    const double = (x: number) => Result.ok<number, Error>(x * 2);

    const result = pipe(Result.ok<number, Error>(5), add1, double);
    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(12); // (5 + 1) * 2
  });

  it('should short-circuit on the first failure', () => {
    const add1 = (x: number) => Result.ok<number, Error>(x + 1);
    const fail = (_x: number) => Result.fail<number, Error>(new Error('broken'));
    const double = jest.fn((x: number) => Result.ok<number, Error>(x * 2));

    const result = pipe(Result.ok<number, Error>(5), add1, fail, double);
    expect(result.isFailure).toBe(true);
    expect(result.error.message).toBe('broken');
    expect(double).not.toHaveBeenCalled();
  });

  it('should return the initial result if no functions are provided', () => {
    const initial = Result.ok<number, Error>(10);
    const result = pipe(initial);
    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(10);
  });

  it('should return a failed initial result without executing any functions', () => {
    const fn = jest.fn((x: number) => Result.ok<number, Error>(x + 1));
    const initial = Result.fail<number, Error>(new Error('initial fail'));
    const result = pipe(initial, fn);
    expect(result.isFailure).toBe(true);
    expect(result.error.message).toBe('initial fail');
    expect(fn).not.toHaveBeenCalled();
  });

  it('should apply a single function correctly', () => {
    const triple = (x: number) => Result.ok<number, Error>(x * 3);
    const result = pipe(Result.ok<number, Error>(7), triple);
    expect(result.value).toBe(21);
  });

  it('should handle multiple chained transformations', () => {
    const add10 = (x: number) => Result.ok<number, Error>(x + 10);
    const subtract3 = (x: number) => Result.ok<number, Error>(x - 3);
    const multiply2 = (x: number) => Result.ok<number, Error>(x * 2);

    const result = pipe(Result.ok<number, Error>(5), add10, subtract3, multiply2);
    // (5 + 10 - 3) * 2 = 24
    expect(result.value).toBe(24);
  });
});

describe('combine', () => {
  it('should combine all successful results into an array', () => {
    const results = [
      Result.ok<number, Error>(1),
      Result.ok<number, Error>(2),
      Result.ok<number, Error>(3),
    ];
    const combined = combine(results);
    expect(combined.isSuccess).toBe(true);
    expect(combined.value).toEqual([1, 2, 3]);
  });

  it('should return the first failure when any result has failed', () => {
    const results = [
      Result.ok<number, Error>(1),
      Result.fail<number, Error>(new Error('second failed')),
      Result.ok<number, Error>(3),
    ];
    const combined = combine(results);
    expect(combined.isFailure).toBe(true);
    expect(combined.error.message).toBe('second failed');
  });

  it('should return success with an empty array when given no results', () => {
    const combined = combine<number, Error>([]);
    expect(combined.isSuccess).toBe(true);
    expect(combined.value).toEqual([]);
  });

  it('should return the first error when multiple results have failed', () => {
    const results = [
      Result.fail<number, Error>(new Error('first error')),
      Result.fail<number, Error>(new Error('second error')),
    ];
    const combined = combine(results);
    expect(combined.isFailure).toBe(true);
    expect(combined.error.message).toBe('first error');
  });

  it('should work with a single successful result', () => {
    const combined = combine([Result.ok<string, Error>('only')]);
    expect(combined.isSuccess).toBe(true);
    expect(combined.value).toEqual(['only']);
  });

  it('should work with a single failed result', () => {
    const combined = combine([Result.fail<string, Error>(new Error('alone'))]);
    expect(combined.isFailure).toBe(true);
    expect(combined.error.message).toBe('alone');
  });

  it('should fail immediately on the first failed result even with many successes after', () => {
    const results = [
      Result.fail<number, Error>(new Error('early fail')),
      Result.ok<number, Error>(2),
      Result.ok<number, Error>(3),
      Result.ok<number, Error>(4),
    ];
    const combined = combine(results);
    expect(combined.isFailure).toBe(true);
    expect(combined.error.message).toBe('early fail');
  });

  it('should combine string results', () => {
    const results = [
      Result.ok<string, Error>('a'),
      Result.ok<string, Error>('b'),
      Result.ok<string, Error>('c'),
    ];
    const combined = combine(results);
    expect(combined.value).toEqual(['a', 'b', 'c']);
  });
});
