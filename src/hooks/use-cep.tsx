import { useState } from "react";

interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

interface UseCepReturn {
  cepData: CepData | null;
  loading: boolean;
  error: string | null;
  searchCep: (cep: string) => Promise<CepData | null>;
  clearCepData: () => void;
}

export const useCep = (): UseCepReturn => {
  const [cepData, setCepData] = useState<CepData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCep = async (cep: string): Promise<CepData | null> => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');
    
    // Valida formato do CEP
    if (cleanCep.length !== 8) {
      setError("CEP deve ter 8 dígitos");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error("Erro ao consultar CEP");
      }

      const data = await response.json();
      
      if (data.erro) {
        setError("CEP não encontrado");
        setCepData(null);
        return null;
      }

      setCepData(data);
      return data;
    } catch (err) {
      setError("Erro ao consultar CEP. Verifique sua conexão.");
      setCepData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearCepData = () => {
    setCepData(null);
    setError(null);
  };

  return {
    cepData,
    loading,
    error,
    searchCep,
    clearCepData
  };
};