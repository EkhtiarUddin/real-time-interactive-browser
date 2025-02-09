interface ErrorResponse {
  message: string
  suggestion: string
}

interface ErrorPatterns {
  [key: string]: ErrorResponse
}

export const getFormattedError = (error: string | Error): ErrorResponse => {
  if (!error) return {
    message: 'Unknown error',
    suggestion: 'Please try again'
  }

  const errorMessage = typeof error === 'object' ? error.message : error

  const errorPatterns: ErrorPatterns = {
    'net::ERR_CERT_COMMON_NAME_INVALID': {
      message: 'The website\'s security certificate is not valid.',
      suggestion: 'This might be a typo in the URL. Please check the URL and try again.'
    },
    'net::ERR_NAME_NOT_RESOLVED': {
      message: 'Could not find this website.',
      suggestion: 'The domain might be incorrect or your internet connection might be down. Please check your spelling.'
    },
    'net::ERR_CONNECTION_REFUSED': {
      message: 'The website refused to connect.',
      suggestion: 'The site might be down or blocking access. Please try again later.'
    },
    'net::ERR_CONNECTION_TIMED_OUT': {
      message: 'The connection timed out.',
      suggestion: 'Please check your internet connection and try again.'
    },
    'net::ERR_INTERNET_DISCONNECTED': {
      message: 'No internet connection available.',
      suggestion: 'Please check your network connection.'
    },
    'WebSocket': {
      message: 'Lost connection to the browser service.',
      suggestion: 'Please refresh the page to reconnect.'
    }
  }

  for (const [pattern, response] of Object.entries(errorPatterns)) {
    if (errorMessage?.includes(pattern)) {
      return response
    }
  }

  if (errorMessage?.includes('Invalid URL')) {
    return {
      message: 'The URL format is invalid.',
      suggestion: 'Please enter a valid web address (e.g., https://www.google.com)'
    }
  }

  return {
    message: 'An error occurred while loading the page.',
    suggestion: 'Please try again or check if the URL is correct.'
  }
}
