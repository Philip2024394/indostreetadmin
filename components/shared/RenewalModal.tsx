import React, { useState } from 'react';
import { Partner, PaymentMethods, PaymentMethod, PartnerType } from '../../types';
import * as api from '../../services/supabase';
import { useContent } from '../../contexts/ContentContext';
import { Editable } from './Editable';
import { XIcon, ChevronLeftIcon } from './Icons';

interface RenewalModalProps {
  partner: Partner;
  onClose: () => void;
  onSuccess: () => void;
}

const slugifyPartnerType = (type: PartnerType): string => type.toLowerCase().replace(/\s+/g, '-');

const RenewalModal: React.FC<RenewalModalProps> = ({ partner, onClose, onSuccess }) => {
    const { content } = useContent();
    const [selectedPackage, setSelectedPackage] = useState<3 | 6 | 12>(3);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethods[0]);
    const [transactionNumber, setTransactionNumber] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptFileName, setReceiptFileName] = useState('');
    
    const [step, setStep] = useState<'form' | 'confirm' | 'submitted'>('form');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
    const [error, setError] = useState('');

    const slug = slugifyPartnerType(partner.partnerType);
    const prices = {
        3: content.numbers[`membership-price-${slug}-3mo`] || 150000,
        6: content.numbers[`membership-price-${slug}-6mo`] || 280000,
        12: content.numbers[`membership-price-${slug}-12mo`] || 500000,
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setReceiptFile(file);
            setReceiptFileName(file.name);
        }
    };
    
    const handleProceedToConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiptFile) {
            setError('Please upload a receipt screenshot.');
            return;
        }
        if (!transactionNumber.trim()) {
            setError('Please enter the transaction number or reference.');
            return;
        }
        
        setError('');
        setStep('confirm');
    };

    const handleConfirmSubmit = async () => {
        if (!receiptFile) return;
        
        setStatus('submitting');
        setError('');

        try {
            const imageUrl = await api.uploadFile('receipts', receiptFile);

            await api.createRenewalSubmission({
                partnerId: partner.id,
                partnerName: partner.profile.name || partner.profile.shopName || partner.email,
                selectedPackage,
                amountPaid: prices[selectedPackage],
                transactionNumber,
                paymentMethod,
                receiptImage: imageUrl,
            });
            setStatus('idle');
            setStep('submitted');
            onSuccess(); // Trigger data refresh
            setTimeout(onClose, 2000); // Close modal after 2s
        } catch (err) {
            console.error(err);
            setError('Failed to submit renewal. Please try again.');
            setStatus('error');
        }
    };


    const PriceCard: React.FC<{ months: 3 | 6 | 12; price: number }> = ({ months, price }) => (
        <div
            onClick={() => setSelectedPackage(months)}
            className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${selectedPackage === months ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-500' : 'border-gray-300 hover:border-orange-400'}`}
        >
            <p className="font-bold text-lg text-gray-800">{months} Months</p>
            <p className="text-xl font-semibold text-orange-600">
                Rp {price.toLocaleString('id-ID')}
            </p>
        </div>
    );

    const renderContent = () => {
        if (step === 'submitted') {
            return (
                <div className="text-center py-12 flex-1 overflow-y-auto p-6">
                   <h4 className="text-2xl font-bold text-green-600">Submission Received!</h4>
                   <p className="mt-2 text-gray-600">Thank you! Your renewal is now under review. We will notify you once it's approved.</p>
               </div>
            );
        }
        
        if (step === 'confirm') {
            return (
                 <div className="flex-1 overflow-y-auto p-6">
                    <h4 className="font-semibold text-gray-800 text-lg mb-4">Confirm Your Submission</h4>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between"><span className="text-gray-600">Package:</span><span className="font-semibold">{selectedPackage} Months</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Price:</span><span className="font-semibold">Rp {prices[selectedPackage].toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Payment Method:</span><span className="font-semibold">{paymentMethod}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Transaction No:</span><span className="font-semibold">{transactionNumber}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Receipt:</span><span className="font-semibold text-sm truncate max-w-xs">{receiptFileName}</span></div>
                    </div>
                    {error && <p className="text-sm text-red-600 text-center mt-4">{error}</p>}
                    <div className="mt-6 pt-6 border-t flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => setStep('form')}
                            disabled={status === 'submitting'}
                            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                        >
                             <ChevronLeftIcon className="w-4 h-4 mr-1" />
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmSubmit}
                            disabled={status === 'submitting'}
                            className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300"
                        >
                            {status === 'submitting' ? 'Submitting...' : 'Confirm & Submit'}
                        </button>
                    </div>
                </div>
            );
        }
        
        return ( // step === 'form'
            <form onSubmit={handleProceedToConfirm} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <h4 className="font-semibold text-gray-800">1. Select Your Package</h4>
                    <div className="mt-2 grid grid-cols-3 gap-4">
                        <PriceCard months={3} price={prices[3]} />
                        <PriceCard months={6} price={prices[6]} />
                        <PriceCard months={12} price={prices[12]} />
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800">2. Make Payment</h4>
                    <p className="text-sm text-gray-600 mt-1">
                         <Editable editId="renewal-payment-instructions" type="text" defaultValue="Please transfer to the following account and upload your receipt." />
                    </p>
                    <div className="mt-3 text-sm space-y-1">
                        <p>Bank: <span className="font-semibold"><Editable editId="renewal-bank-name" type="text" defaultValue="BCA (Bank Central Asia)" /></span></p>
                        <p>Account No: <span className="font-semibold"><Editable editId="renewal-account-number" type="text" defaultValue="123-456-7890" /></span></p>
                        <p>Account Holder: <span className="font-semibold"><Editable editId="renewal-account-holder" type="text" defaultValue="PT IndoStreet Jaya" /></span></p>
                    </div>
                </div>
                
                <div>
                    <h4 className="font-semibold text-gray-800">3. Submit Proof of Payment</h4>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                            <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                                {PaymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="transactionNumber" className="block text-sm font-medium text-gray-700">Transaction/Reference Number</label>
                            <input type="text" id="transactionNumber" value={transactionNumber} onChange={(e) => setTransactionNumber(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Upload Receipt Screenshot</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    {receiptFileName && <p className="text-sm font-semibold text-green-600 mt-2">{receiptFileName}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                
                 <div className="!mt-auto">
                    <div className="p-4 bg-gray-50 border-t flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300"
                        >
                            Proceed to Confirmation
                        </button>
                    </div>
                </div>
            </form>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={status === 'submitting' ? undefined : onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-semibold text-gray-800">Renew Membership</h3>
                    <button onClick={onClose} disabled={status === 'submitting'} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default RenewalModal;