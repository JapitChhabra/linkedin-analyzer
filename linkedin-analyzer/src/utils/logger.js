// Logger utility for frontend
const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

class Logger {
  constructor() {
    this.isDebugEnabled = import.meta.env.MODE === 'development';
  }

  _formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      data
    };
  }

  _log(level, message, data) {
    const formattedLog = this._formatMessage(level, message, data);
    
    switch (level) {
      case LOG_LEVELS.DEBUG:
        if (this.isDebugEnabled) {
          console.debug(formattedLog);
        }
        break;
      case LOG_LEVELS.INFO:
        console.info(formattedLog);
        break;
      case LOG_LEVELS.WARN:
        console.warn(formattedLog);
        break;
      case LOG_LEVELS.ERROR:
        console.error(formattedLog);
        // In a production environment, you might want to send errors to a monitoring service
        this._reportError(formattedLog);
        break;
    }
  }

  _reportError(errorLog) {
    // TODO: Implement error reporting to a monitoring service
    // This is where you would integrate with services like Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // Send to monitoring service
    }
  }

  debug(message, data = null) {
    this._log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data = null) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data = null) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  error(message, error = null, context = null) {
    const errorData = {
      error: error?.message || error,
      stack: error?.stack,
      context
    };
    this._log(LOG_LEVELS.ERROR, message, errorData);
  }

  // Performance logging
  startTimer(label) {
    if (this.isDebugEnabled) {
      console.time(label);
    }
  }

  endTimer(label) {
    if (this.isDebugEnabled) {
      console.timeEnd(label);
    }
  }

  // Group related logs
  group(label) {
    if (this.isDebugEnabled) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.isDebugEnabled) {
      console.groupEnd();
    }
  }
}

export const logger = new Logger(); 