import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PaymentSuccessClose = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Envia mensagem para a aba pai informando o sucesso
    if (window.opener) {
      window.opener.postMessage({ 
        type: 'PAYMENT_SUCCESS', 
        sessionId 
      }, '*');
      // Fecha a aba atual
      window.close();
    } else {
      // Se não conseguir fechar, redireciona para o dashboard
      window.location.href = "/dashboard-access";
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-2">Pagamento Aprovado!</h1>
        <p className="text-green-600">Fechando janela e redirecionando...</p>
      </div>
    </div>
  );
};

export default PaymentSuccessClose;