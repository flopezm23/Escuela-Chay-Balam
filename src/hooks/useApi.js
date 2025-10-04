import { useState } from "react";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiCall, successMessage = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      if (successMessage) {
        console.log(successMessage);
        // Aquí podrías agregar un toast de éxito
        alert(successMessage);
      }
      return result;
    } catch (err) {
      const errorMessage =
        typeof err === "string" ? err : err.message || "Error en la operación";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    callApi,
    clearError,
  };
};
