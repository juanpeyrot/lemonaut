import { describe, it, expect } from "vitest";
import { HttpError } from "../../src/errors";
import {
  BadGatewayError,
  BadRequestError,
  ConflictError,
  DuplicatedDataError,
  ForbiddenError,
  GatewayTimeoutError,
  GoneError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  NotImplementedError,
  PayloadTooLargeError,
  ServiceUnavailableError,
  TooManyRequestsError,
  UnauthorizedError,
  UnprocessableEntityError,
  UnsupportedMediaTypeError,
} from '../../src/errors';

describe('HTTP Error Classes', () => {
  describe('BadGateway (502)', () => {
    it('should create error with default message', () => {
      const error = new BadGatewayError();
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(502);
      expect(error.message).toBe('Bad Gateway');
      expect(error.name).toBe('BadGatewayError');
    });

    it('should allow custom message and details', () => {
      const details = { service: 'Auth Service' };
      const error = new BadGatewayError('Custom message', details);
      expect(error.message).toBe('Custom message');
      expect(error.details).toEqual(details);
    });
  });

  describe('BadRequest (400)', () => {
    it('should create error with default message', () => {
      const error = new BadRequestError();
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.name).toBe('BadRequestError');
    });

    it('should accept validation errors in details', () => {
      const validationErrors = { email: 'Invalid format' };
      const error = new BadRequestError('Validation failed', validationErrors);
      expect(error.details).toEqual(validationErrors);
    });
  });

  describe('Conflict (409)', () => {
    it('should create error with default message', () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Conflict');
    });

    it('should include resource details', () => {
      const error = new ConflictError('Resource already exists', { id: 123 });
      expect(error.details).toEqual({ id: 123 });
    });
  });

  describe('DuplicatedData (409)', () => {
    it('should create error with default message', () => {
      const error = new DuplicatedDataError();
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Data already exists');
    });
  });

  describe('Forbidden (403)', () => {
    it('should create error with default message', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('should include permission details', () => {
      const error = new ForbiddenError('Missing permission', { required: 'admin' });
      expect(error.details).toEqual({ required: 'admin' });
    });
  });

  describe('GatewayTimeout (504)', () => {
    it('should create error with default message', () => {
      const error = new GatewayTimeoutError();
      expect(error.statusCode).toBe(504);
      expect(error.message).toBe('Gateway Timeout');
    });
  });

  describe('Gone (410)', () => {
    it('should create error with default message', () => {
      const error = new GoneError();
      expect(error.statusCode).toBe(410);
      expect(error.message).toBe('Gone');
    });
  });

  describe('InternalServer (500)', () => {
    it('should create error with default message', () => {
      const error = new InternalServerError();
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal Server Error');
    });

    it('should include error details for logging', () => {
      const error = new InternalServerError('DB Connection failed', { stack: '...' });
      expect(error.details).toEqual({ stack: '...' });
    });
  });

  describe('MethodNotAllowed (405)', () => {
    it('should create error with default message', () => {
      const error = new MethodNotAllowedError();
      expect(error.statusCode).toBe(405);
      expect(error.message).toBe('Method Not Allowed');
    });

    it('should include allowed methods', () => {
      const error = new MethodNotAllowedError('Use GET instead', { allowed: ['GET'] });
      expect(error.details).toEqual({ allowed: ['GET'] });
    });
  });

  describe('NotFound (404)', () => {
    it('should create error with default message', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not Found');
    });

    it('should include resource details', () => {
      const error = new NotFoundError('User not found', { userId: 456 });
      expect(error.details).toEqual({ userId: 456 });
    });
  });

  describe('NotImplemented (501)', () => {
    it('should create error with default message', () => {
      const error = new NotImplementedError();
      expect(error.statusCode).toBe(501);
      expect(error.message).toBe('Not Implemented');
    });
  });

  describe('PayloadTooLarge (413)', () => {
    it('should create error with default message', () => {
      const error = new PayloadTooLargeError();
      expect(error.statusCode).toBe(413);
      expect(error.message).toBe('Payload Too Large');
    });

    it('should include size limits', () => {
      const error = new PayloadTooLargeError('File too large', { maxSize: '10MB' });
      expect(error.details).toEqual({ maxSize: '10MB' });
    });
  });

  describe('ServiceUnavailable (503)', () => {
    it('should create error with default message', () => {
      const error = new ServiceUnavailableError();
      expect(error.statusCode).toBe(503);
      expect(error.message).toBe('Service Unavailable');
    });

    it('should include retry info', () => {
      const error = new ServiceUnavailableError('Try again later', { retryAfter: 60 });
      expect(error.details).toEqual({ retryAfter: 60 });
    });
  });

  describe('TooManyRequests (429)', () => {
    it('should create error with default message', () => {
      const error = new TooManyRequestsError();
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('Too Many Requests');
    });

    it('should include rate limit info', () => {
      const error = new TooManyRequestsError('Slow down', { limit: 100, remaining: 0 });
      expect(error.details).toEqual({ limit: 100, remaining: 0 });
    });
  });

  describe('Unauthorized (401)', () => {
    it('should create error with default message', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('should include auth challenges', () => {
      const error = new UnauthorizedError('Login required', { realm: 'API' });
      expect(error.details).toEqual({ realm: 'API' });
    });
  });

  describe('UnprocessableEntity (422)', () => {
    it('should create error with default message', () => {
      const error = new UnprocessableEntityError();
      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Unprocessable Entity');
    });

    it('should include validation errors', () => {
      const errors = { field: 'Invalid value' };
      const error = new UnprocessableEntityError('Validation failed', errors);
      expect(error.details).toEqual(errors);
    });
  });

  describe('UnsupportedMediaType (415)', () => {
    it('should create error with default message', () => {
      const error = new UnsupportedMediaTypeError();
      expect(error.statusCode).toBe(415);
      expect(error.message).toBe('Unsupported Media Type');
    });

    it('should include accepted types', () => {
      const error = new UnsupportedMediaTypeError('Use JSON', { accepted: ['application/json'] });
      expect(error.details).toEqual({ accepted: ['application/json'] });
    });
  });
});

describe("HttpError", () => {
  it("should create an error with message and status code", () => {
    const error = new HttpError("Not Found", 404);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.message).toBe("Not Found");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("HttpError");
    expect(error.details).toBeUndefined();
    expect(error.stack).toBeDefined();
  });

  it("should include details if provided", () => {
    const details = { reason: "Invalid ID" };
    const error = new HttpError("Bad Request", 400, details);

    expect(error.details).toEqual(details);
  });

  it('should create error with correct properties', () => {
    const details = { reason: 'Invalid token' };
    const error = new UnauthorizedError('Custom message', details);
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.name).toBe('UnauthorizedError');
    expect(error.message).toBe('Custom message');
    expect(error.statusCode).toBe(401);
    expect(error.details).toEqual(details);
  });

  it('should use default message when not provided', () => {
    const error = new UnauthorizedError();
    expect(error.message).toBe('Unauthorized');
  });
});