const PASSWORD_RESET_FLAG = 'amylens.passwordResetCompleted'
const DEV_PASSWORD_KEY = 'amylens.devPassword'
const DEFAULT_DEV_PASSWORD = 'test'

export function hasCompletedPasswordReset() {
  try {
    return window.localStorage.getItem(PASSWORD_RESET_FLAG) === 'true'
  } catch {
    return false
  }
}

export function markPasswordResetCompleted() {
  try {
    window.localStorage.setItem(PASSWORD_RESET_FLAG, 'true')
  } catch {
    // Ignore storage failures; the backend reset already succeeded.
  }
}

export function getDevPassword() {
  try {
    return window.localStorage.getItem(DEV_PASSWORD_KEY) || DEFAULT_DEV_PASSWORD
  } catch {
    return DEFAULT_DEV_PASSWORD
  }
}

export function setDevPassword(password) {
  try {
    window.localStorage.setItem(DEV_PASSWORD_KEY, password)
  } catch {
    // Ignore storage failures; the session can still continue in-memory.
  }
}