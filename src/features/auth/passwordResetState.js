const PASSWORD_RESET_REQUIRED_KEY = 'amylens.passwordResetRequired'

export function isPasswordResetRequired() {
  try {
    return window.sessionStorage.getItem(PASSWORD_RESET_REQUIRED_KEY) === 'true'
  } catch {
    return false
  }
}

export function markPasswordResetRequired() {
  try {
    window.sessionStorage.setItem(PASSWORD_RESET_REQUIRED_KEY, 'true')
  } catch {
    // Ignore session storage failures; the backend session remains authoritative.
  }
}

export function clearPasswordResetRequired() {
  try {
    window.sessionStorage.removeItem(PASSWORD_RESET_REQUIRED_KEY)
  } catch {
    // Ignore session storage failures; the backend session remains authoritative.
  }
}