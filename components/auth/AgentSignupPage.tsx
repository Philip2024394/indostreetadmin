import React, { useState, useRef } from 'react';
import * as api from '../../services/supabase';
import { AgentApplication } from '../../types';
import { ChevronLeftIcon, CheckCircleIcon } from '../shared/Icons';

interface AgentSignupPageProps {
  onBackToLogin: () => void;
}

const AgentSignupPage: React.FC<AgentSignupPageProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Omit<AgentApplication, 'idCardImage' | 'profilePhotoImage'>> & { email?: string; password?: string; confirmPassword?: string; agreedToTerms?: boolean }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nik: '',
    age: 18,
    whatsapp: '',
    address: '',
    lastJob: '',
    transport: 'own',
    equipment: [],
    shirtSize: 'M',
    policeRecord: false,
    agreedToTerms: false,
  });
  const [files, setFiles] = useState<{ idCardImage?: File; profilePhotoImage?: File }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState({ idCardImage: '', profilePhotoImage: '' });

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        if (name === 'equipment') {
            setFormData(prev => {
                const currentEquipment = prev.equipment || [];
                const newEquipment = checked ? [...currentEquipment, value] : currentEquipment.filter(item => item !== value);
                return { ...prev, equipment: newEquipment as ('laptop' | 'phone')[] };
            });
        } else {
             setFormData(prev => ({ ...prev, [name]: checked }));
        }
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
        const file = selectedFiles[0];
        setFiles(prev => ({ ...prev, [name]: file }));
        setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!formData.agreedToTerms) {
        setError("You must agree to the terms and conditions.");
        return;
      }
      if (!files.idCardImage || !files.profilePhotoImage) {
        setError("Please upload both ID card and profile photo.");
        return;
      }

      setLoading(true);
      try {
        const idCardImageUrl = await api.uploadFile('documents', files.idCardImage);
        const profilePhotoImageUrl = await api.uploadFile('avatars', files.profilePhotoImage);

        const { password, confirmPassword, agreedToTerms, ...appData } = formData;
        
        await api.submitAgentApplication({
            ...(appData as Omit<AgentApplication, 'id' | 'status' | 'submittedAt' | 'idCardImage' | 'profilePhotoImage'>),
            idCardImage: idCardImageUrl,
            profilePhotoImage: profilePhotoImageUrl,
        });
        setStep(6); // Success step
      } catch (err: any) {
        setError(err.message || 'An error occurred during submission.');
      } finally {
        setLoading(false);
      }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Account Info
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Account Information</h3>
            <InputField name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} required />
            <InputField name="password" label="Password" type="password" value={formData.password} onChange={handleChange} required />
            <InputField name="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} required />
          </div>
        );
      case 2: // Personal Details
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Personal Details</h3>
            <InputField name="name" label="Full Name (as per KTP)" value={formData.name} onChange={handleChange} required />
            <InputField name="nik" label="NIK (ID Number)" value={formData.nik} onChange={handleChange} required />
            <InputField name="age" label="Age" type="number" value={formData.age} onChange={handleChange} required />
            <InputField name="whatsapp" label="WhatsApp Number" value={formData.whatsapp} onChange={handleChange} required />
          </div>
        );
      case 3: // Background Info
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Background Information</h3>
            <InputField name="address" label="Current Living Address" value={formData.address} onChange={handleChange} required />
            <InputField name="lastJob" label="Previous Job" value={formData.lastJob} onChange={handleChange} required />
            <RadioGroup label="Do you own transport?" name="transport" value={formData.transport} onChange={handleChange} options={[{value: 'own', label: 'Own'}, {value: 'borrowed', label: 'Borrowed'}]} />
            <CheckboxGroup label="What equipment do you have?" name="equipment" values={formData.equipment} onChange={handleChange} options={[{value: 'laptop', label: 'Laptop'}, {value: 'phone', label: 'Smartphone'}]} />
          </div>
        );
      case 4: // Verification
        return (
           <div className="space-y-4">
            <h3 className="text-xl font-semibold">Verification & Sizing</h3>
            <div>
                <label className="block text-sm font-medium text-gray-200">Shirt Size</label>
                <select name="shirtSize" value={formData.shirtSize} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md p-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <RadioGroup label="Have you ever been in trouble with the police?" name="policeRecord" value={String(formData.policeRecord)} onChange={e => setFormData(p => ({...p, policeRecord: e.target.value === 'true'}))} options={[{value: 'false', label: 'No'}, {value: 'true', label: 'Yes'}]} />
            <ImageUploadField label="Upload KTP (ID Card)" name="idCardImage" preview={previews.idCardImage} onChange={handleFileChange} required />
            <ImageUploadField label="Upload Your Photo" name="profilePhotoImage" preview={previews.profilePhotoImage} onChange={handleFileChange} required />
          </div>
        );
      case 5: // Review
        return (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Review Your Application</h3>
                <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(formData).map(([key, value]) => {
                        if (['password', 'confirmPassword', 'agreedToTerms'].includes(key)) return null;
                        return <p key={key} className="text-sm"><strong className="capitalize text-gray-400">{key.replace(/([A-Z])/g, ' $1')}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}</p>
                    })}
                </div>
                <div className="p-4 bg-yellow-900/50 border-l-4 border-yellow-500 text-sm">
                    <p className="font-bold text-yellow-300">Warning!</p>
                    <p className="text-yellow-400">If any information provided is found to be false, the police will be informed to investigate without prior notice.</p>
                </div>
                 <div>
                    <label className="flex items-center">
                        <input type="checkbox" name="agreedToTerms" checked={!!formData.agreedToTerms} onChange={handleChange} className="h-4 w-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"/>
                        <span className="ml-2 text-sm text-gray-300">I confirm that all information provided is true and I agree to the terms.</span>
                    </label>
                </div>
            </div>
        );
        case 6: // Success
            return (
                <div className="text-center py-8">
                    <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
                    <h3 className="text-2xl font-bold mt-4">Application Submitted!</h3>
                    <p className="text-gray-300 mt-2">Thank you for your application. We will review your details and contact you via email and WhatsApp soon.</p>
                    <button onClick={onBackToLogin} className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">Back to Login</button>
                </div>
            )
      default:
        return null;
    }
  };

  const totalSteps = 5;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200 p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-2xl">
        <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-center">
                <span className="text-white">Indo</span><span className="text-orange-500">Street</span>
            </h1>
            <h2 className="text-xl font-semibold text-gray-300 text-center mt-1">Agent Registration</h2>
             {step <= totalSteps && (
                <div className="mt-4">
                    <div className="flex justify-between text-sm font-medium text-gray-400">
                        <span>Step {step} of {totalSteps}</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2 mt-1">
                        <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{width: `${(step / totalSteps) * 100}%`}}></div>
                    </div>
                </div>
            )}
        </div>
        <form onSubmit={handleSubmit} className="p-6">
            {renderStep()}
            {error && <p className="text-sm text-red-400 text-center mt-4">{error}</p>}
        </form>
         {step <= totalSteps && (
            <div className="p-6 bg-gray-900/50 border-t border-gray-700 flex justify-between items-center">
                <button type="button" onClick={step === 1 ? onBackToLogin : handlePrev} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500">
                     <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    {step === 1 ? 'Back to Login' : 'Previous'}
                </button>
                {step < totalSteps && <button type="button" onClick={handleNext} className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">Next</button>}
                {step === totalSteps && <button type="submit" formNoValidate onClick={handleSubmit} disabled={loading || !formData.agreedToTerms} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed">{loading ? 'Submitting...' : 'Submit Application'}</button>}
            </div>
        )}
      </div>
    </div>
  );
};

const InputField: React.FC<{ name: string; label: string; value?: string | number; onChange: (e: any) => void; type?: string; required?: boolean; }> = 
({ name, label, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300">{label}{required && ' *'}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-sm focus:ring-orange-500 focus:border-orange-500"/>
    </div>
);

const RadioGroup: React.FC<{ label: string; name: string; value?: string; onChange: (e: any) => void; options: {value: string; label: string}[] }> = 
({ label, name, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <div className="mt-2 flex space-x-4">
            {options.map(opt => (
                <label key={opt.value} className="flex items-center">
                    <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} className="h-4 w-4 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"/>
                    <span className="ml-2 text-sm text-gray-300">{opt.label}</span>
                </label>
            ))}
        </div>
    </div>
);

const CheckboxGroup: React.FC<{ label: string; name: string; values?: ('laptop' | 'phone')[]; onChange: (e: any) => void; options: {value: string; label: string}[] }> =
({ label, name, values = [], onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <div className="mt-2 flex space-x-4">
            {options.map(opt => (
                <label key={opt.value} className="flex items-center">
                    <input
                        type="checkbox"
                        name={name}
                        value={opt.value}
                        checked={values.includes(opt.value as 'laptop' | 'phone')}
                        onChange={onChange}
                        className="h-4 w-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-300">{opt.label}</span>
                </label>
            ))}
        </div>
    </div>
);

const ImageUploadField: React.FC<{ label: string; name: string; preview: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }> =
({ label, name, preview, onChange, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}{required && ' *'}</label>
        <div className="mt-1 flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-700 rounded-md flex items-center justify-center border border-gray-600">
                {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-md"/>
                ) : (
                    <span className="text-xs text-gray-400">Preview</span>
                )}
            </div>
             <label htmlFor={name} className="cursor-pointer text-sm font-medium text-orange-500 hover:text-orange-400">
                Upload File
                <input type="file" id={name} name={name} onChange={onChange} required={required} accept="image/*" className="sr-only"/>
            </label>
        </div>
    </div>
);

export default AgentSignupPage;
