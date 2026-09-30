export const ErrorResponse = ({
    message = "Something went wrong.",
    status = 400,
    extra = undefined
} = {}) => {
    throw new Error(message, { cause: { status, extra } });
}

export const ConflictException = (message = "Conflict", extra = undefined) => {
    return ErrorResponse({ message, status: 409, extra })
}

export const BadRequestException = (message = "Bad request", extra = undefined) => {
    return ErrorResponse({ message, status: 400, extra })
}

export const NotFoundException = (message = "Not found", extra = undefined) => {
    return ErrorResponse({ message, status: 404, extra })
}

export const UnauthorizedException = (message = "Unauthorized", extra = undefined) => {
    return ErrorResponse({ message, status: 401, extra })
}

export const ForbiddenException = (message = "Forbidden", extra = undefined) => {
    return ErrorResponse({ message, status: 403, extra })
}