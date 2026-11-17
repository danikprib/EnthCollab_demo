namespace EnthCollab.Api.Exceptions;

public abstract class AppException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
public class NotFoundException(string m) : AppException(m, StatusCodes.Status404NotFound);
public class ConflictException(string m) : AppException(m, StatusCodes.Status409Conflict);
public class UnauthorizedException(string m) : AppException(m, StatusCodes.Status401Unauthorized);
public class ForbiddenException(string m) : AppException(m, StatusCodes.Status403Forbidden);
