import { HttpErrorResponse } from '@angular/common/http';

export function extractErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const messageFromBody =
      (error.error && typeof error.error === 'object' && 'message' in error.error
        ? (error.error.message as string)
        : null) || (typeof error.error === 'string' ? error.error : null);

    if (messageFromBody) return messageFromBody;

    switch (error.status) {
      case 0:
        return 'Network error — unable to reach the server.';
      case 400:
        return 'Bad request — check your input data.';
      case 401:
        return 'Unauthorized — please log in.';
      case 403:
        return 'Forbidden — you do not have access.';
      case 404:
        return 'Product not found.';
      case 500:
        return 'Server error — please try again later.';
      default:
        return `Unexpected error (${error.status}): ${error.statusText}`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred.';
}
