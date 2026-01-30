import type { PaymentFlowState } from '../../hooks/useCheckoutViewModel';
import type { Transaction } from '../../types';

interface PaymentStatusViewProps {
  paymentFlow: Exclude<PaymentFlowState, 'idle'>;
  transaction: Transaction | null;
  transactionError: string | null;
  onClose: () => void;
  formatPrice: (price: number) => string;
}

export const PaymentStatusView = ({
  paymentFlow,
  transaction,
  transactionError,
  onClose,
  formatPrice,
}: PaymentStatusViewProps) => {
  if (paymentFlow === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Procesando pago...</h2>
        <p className="text-sm text-gray-600">Estamos comunicándonos con Business</p>
      </div>
    );
  }
  if (paymentFlow === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-pulse mb-6">
          <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transacción Pendiente</h2>
        <p className="text-sm text-gray-600 mb-4">Esperando confirmación del banco...</p>
        {transaction?.id && <div className="text-xs text-gray-500">ID: {transaction.id}</div>}
      </div>
    );
  }
  if (paymentFlow === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultando estado...</h2>
        <p className="text-sm text-gray-600">Verificando con Business</p>
      </div>
    );
  }
  if (paymentFlow === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-6">
          <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-red-600">Error al procesar el pago</h2>
        <p className="text-sm text-gray-600 mb-8 text-center max-w-md">
          {transactionError || 'No se pudo completar la transacción. Por favor revisa los datos e intenta de nuevo.'}
        </p>
        <button onClick={onClose} className="w-full max-w-md rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Intentar de nuevo
        </button>
        <div className="mt-6 text-center text-[10px] md:text-[11px] text-gray-400">powered by business payments</div>
      </div>
    );
  }
  if (paymentFlow === 'completed' && transaction) {
    const isApproved = transaction.status === 'APPROVED';
    const isDeclined = transaction.status === 'DECLINED';
    const isPending = transaction.status === 'PENDING';
    return (
      <div className="flex flex-col items-center justify-center py-12">
        {isApproved && (
          <div className="mb-6">
            <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        {isDeclined && (
          <div className="mb-6">
            <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        {isPending && (
          <div className="mb-6 animate-pulse">
            <svg className="w-20 h-20 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isApproved ? 'text-green-600' : isDeclined ? 'text-red-600' : 'text-yellow-600'}`}>
          {isApproved && '¡Pago Aprobado!'}
          {isDeclined && 'Pago Rechazado'}
          {isPending && 'Pago Pendiente'}
        </h2>
        <p className="text-sm text-gray-600 mb-8 text-center max-w-md">
          {isApproved && 'Tu compra ha sido procesada exitosamente. Recibirás un correo de confirmación.'}
          {isDeclined && (transaction.errorMessage || 'El pago fue rechazado. Por favor intenta con otra tarjeta.')}
          {isPending && 'La transacción está siendo procesada por el banco. Te notificaremos cuando se complete.'}
        </p>
        <div className="w-full max-w-md space-y-3 mb-8">
          <div className="flex justify-between text-sm p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">ID de Transacción:</span>
            <span className="font-mono text-xs text-gray-900">{transaction.id.substring(0, 20)}...</span>
          </div>
          {transaction.businessTransactionId && (
            <div className="flex justify-between text-sm p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">ID Business:</span>
              <span className="font-mono text-xs text-gray-900">{transaction.businessTransactionId}</span>
            </div>
          )}
          <div className="flex justify-between text-sm p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Monto Total:</span>
            <span className="font-bold text-gray-900">{formatPrice(transaction.totalAmount)}</span>
          </div>
          {transaction.cardLastFour && (
            <div className="flex justify-between text-sm p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Tarjeta:</span>
              <span className="font-medium text-gray-900">**** **** **** {transaction.cardLastFour}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 w-full max-w-md">
          {isApproved && (
            <button onClick={() => { onClose(); window.location.href = '/'; }} className="w-full rounded-xl bg-teal-600 py-3 text-sm font-medium text-white hover:bg-teal-700 transition-colors">
              Ir al Inicio
            </button>
          )}
          {isDeclined && (
            <button onClick={onClose} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Intentar de Nuevo
            </button>
          )}
          {isPending && (
            <button onClick={onClose} className="w-full rounded-xl bg-gray-600 py-3 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
              Entendido
            </button>
          )}
        </div>
        <div className="mt-6 text-center text-[10px] md:text-[11px] text-gray-400">powered by business payments</div>
      </div>
    );
  }
  return null;
};
