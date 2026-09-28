// One error type for every failed API call, whichever backend is in use.
//
//   status  the HTTP status (404, 400...), or 0 when the server was unreachable
//   fields  { fieldName: 'message' } for validation errors, so forms can show
//           each message next to the right input

export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

export function isNotFound(error) {
  return error instanceof ApiError && error.status === 404
}

// Fired when the server says the saved login is no longer valid. AuthContext
// listens for it and sends the user back to the login page.
export const SESSION_EXPIRED_EVENT = 'cologger:session-expired'
