


export class AppError extends Error {
    public readonly statusCode
    constructor( message: string, statusCode: number){
        super(message)
        this.statusCode = statusCode
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }
}
export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Duplicate entry found') {
        super(message, 409);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export const parseDatabaseError = (err: any): AppError => {
    if (err.name === 'CastError' || err.name === 'NotFoundError') {
        return new NotFoundError(err.message);
    }
    if (err.code === 11000 || err.code === 'P2002') {
        return new ConflictError(err.message);
    }
    if (err.name === 'ValidationError') {
        return new ValidationError(err.message);
    }
    return new AppError(err.message || 'Internal database error', 500);
};
