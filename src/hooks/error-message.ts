import { useState, useCallback } from 'react';

export function useErrorMessage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCloseError = useCallback((event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrorMessage(null);
  }, []);

  return { errorMessage, setErrorMessage, handleCloseError };
}
