import React, { useState } from 'react';
import { Smartphone, CreditCard, ShieldCheck, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

interface MockPaymentModalProps {
  isOpen: boolean;
  totalAmountUGX: number;
  onClose: () => void;
  onPaymentSuccess: (method: string) => Promise<void>;
}

export const MockPaymentModal: React.FC<MockPaymentModalProps> = ({
  isOpen,
  totalAmountUGX,
  onClose,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'MTN_MOMO' | 'AIRTEL_MONEY' | 'VISA_CARD'>('MTN_MOMO');
  const [phone, setPhone] = useState('0771234567');
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010');
  const [processing, setProcessing] = useState(false);
  const [ussdPrompt, setUssdPrompt] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePay = async () => {
    setError('');

    if (method === 'MTN_MOMO' || method === 'AIRTEL_MONEY') {
      if (!phone || phone.length < 10) {
        setError('Please enter a valid Ugandan phone number');
        return;
      }
      setUssdPrompt(true);
      setProcessing(true);

      setTimeout(async () => {
        try {
          await onPaymentSuccess(method);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Payment processing failed');
          setProcessing(false);
          setUssdPrompt(false);
        }
      }, 2500);
    } else {
      if (!cardNumber || cardNumber.length < 16) {
        setError('Please enter a valid 16-digit card number');
        return;
      }
      setProcessing(true);
      setTimeout(async () => {
        try {
          await onPaymentSuccess(method);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Card payment failed');
          setProcessing(false);
        }
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden text-left max-h-[90vh] overflow-y-auto">
        {/* Header Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm font-mono">MUST Digital Gateway</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal">
                Mobile Money & Card Checkout • Instant E-Ticket
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Method selector */}
        <div className="space-y-2">
          <label className="text-xs text-slate-500 font-medium uppercase font-mono block">Select Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setMethod('MTN_MOMO')}
              className={`p-2 sm:p-3 rounded-xl border text-center transition-colors ${
                method === 'MTN_MOMO'
                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-amber-600" />
              <span className="text-[10px] sm:text-xs block">MTN MoMo</span>
            </button>

            <button
              onClick={() => setMethod('AIRTEL_MONEY')}
              className={`p-2 sm:p-3 rounded-xl border text-center transition-colors ${
                method === 'AIRTEL_MONEY'
                  ? 'bg-red-50 border-red-400 text-red-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-red-600" />
              <span className="text-[10px] sm:text-xs block">Airtel Money</span>
            </button>

            <button
              onClick={() => setMethod('VISA_CARD')}
              className={`p-2 sm:p-3 rounded-xl border text-center transition-colors ${
                method === 'VISA_CARD'
                  ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
              }`}
            >
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-blue-800" />
              <span className="text-[10px] sm:text-xs block">Visa / Card</span>
            </button>
          </div>
        </div>

        {/* Inputs */}
        {(method === 'MTN_MOMO' || method === 'AIRTEL_MONEY') && (
          <div className="space-y-1.5">
            <label className="text-xs text-slate-700 font-medium block">
              {method === 'MTN_MOMO' ? 'MTN' : 'Airtel'} Phone Number (USSD Push Prompt)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0771234567"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 font-mono text-xs font-medium focus:border-blue-800 focus:outline-none"
            />
          </div>
        )}

        {method === 'VISA_CARD' && (
          <div className="space-y-1.5">
            <label className="text-xs text-slate-700 font-medium block">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4000 0000 0000 0000"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 font-mono text-xs font-medium focus:border-blue-800 focus:outline-none"
            />
          </div>
        )}

        {/* Total fare display */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center font-mono">
          <span className="text-xs text-slate-500 font-medium">Total Amount:</span>
          <span className="text-lg sm:text-xl font-bold text-blue-800">
            UGX {totalAmountUGX.toLocaleString()}
          </span>
        </div>

        {/* USSD Simulator Overlay */}
        {ussdPrompt && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 font-mono">
            <div className="font-semibold flex items-center gap-2 text-amber-950">
              <Smartphone className="w-4 h-4 text-amber-700" />
              USSD Prompt Sent to {phone}
            </div>
            <p className="text-[11px] font-normal">Processing: "Pay UGX {totalAmountUGX.toLocaleString()} to MUST Bus Network. Enter PIN to confirm..."</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            disabled={processing}
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            disabled={processing}
            onClick={handlePay}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-medium uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Confirm & Pay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
