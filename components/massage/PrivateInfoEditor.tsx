import React, { useState } from 'react';
import { Partner } from '../../types';
import { blobToBase64 } from '../shared/Editable';
import { ExclamationCircleIcon } from '../shared/Icons';

interface PrivateInfoEditorProps {
    partner: Partner;
    onUpdate: (data: Partial<Partner>) => Promise<void>;
    onViewTOS: () => void;
}

const InputField: React.FC<{ label: string, name: string, value: string | number | undefined, onChange: (e: any) => void, type?: string, placeholder?: string, required?: boolean }> = 
({ label, name, value, onChange, type = 'text', placeholder, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} id={name} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} required={required} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 sm:text-sm"/>
    </div>
);

const PrivateInfoEditor: React.FC<PrivateInfoEditorProps> = ({ partner, onUpdate, onViewTOS }) => {
    const [formData, setFormData] = useState(partner.privateInfo || {});
    const [saving, setSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await blobToBase64(file);
            setFormData(prev => ({ ...prev, idCardImage: base64 }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        await onUpdate({ privateInfo: formData });
        setSaving(false);
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800">Private Information</h3>
            <div className="mt-2 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            This information is for administrative and verification purposes only. It will <strong className="font-semibold">not</strong> be displayed on your public profile.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Full Legal Name (as per KTP)" name="legalName" value={formData.legalName} onChange={handleChange} required />
                    <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="">Select...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                     <InputField label="Religion" name="religion" value={formData.religion} onChange={handleChange} />
                     <InputField label="Years of Experience" name="experienceYears" type="number" value={formData.experienceYears} onChange={handleChange} />
                </div>
                
                <InputField label="Personal Address (as per KTP)" name="personalAddress" value={formData.personalAddress} onChange={handleChange} />
                
                <div>
                     <label className="block text-sm font-medium text-gray-700">Indonesian ID (e-KTP)</label>
                     <div className="mt-2 flex items-center space-x-4">
                        <div className="w-48 h-32 bg-gray-100 rounded-md flex items-center justify-center border">
                            {formData.idCardImage ? (
                                <img src={`data:image/png;base64,${formData.idCardImage}`} alt="KTP Preview" className="w-full h-full object-contain rounded-md"/>
                            ) : (
                                <span className="text-xs text-gray-500">Preview</span>
                            )}
                        </div>
                         <label htmlFor="id-card-upload" className="cursor-pointer text-sm font-medium text-orange-600 hover:text-orange-700">
                            Upload Image
                            <input type="file" id="id-card-upload" name="idCardImage" onChange={handleFileChange} required accept="image/*" className="sr-only"/>
                        </label>
                    </div>
                </div>
                
                <div className="pt-5 border-t">
                    <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="noCriminalRecord"
                                name="noCriminalRecord"
                                type="checkbox"
                                checked={!!formData.noCriminalRecord}
                                onChange={handleChange}
                                className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="noCriminalRecord" className="font-medium text-gray-700">Declaration of No Criminal Record</label>
                            <p className="text-gray-500">By checking this box, I solemnly declare that I have no criminal record in Indonesia or any other country.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-5 border-t">
                    <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="agreedToTerms"
                                name="agreedToTerms"
                                type="checkbox"
                                checked={!!formData.agreedToTerms}
                                onChange={handleChange}
                                className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="agreedToTerms" className="font-medium text-gray-700">Self-Employment &amp; Platform Agreement</label>
                            <p className="text-gray-500">
                                I acknowledge I am self-employed and solely responsible for all personal taxes and government fees.
                                I understand that IndoStreet is a directory platform for connecting with customers and not my employer.
                                I agree to the full <button type="button" onClick={onViewTOS} className="text-orange-600 underline hover:text-orange-800">Partner Terms of Service</button>.
                            </p>
                        </div>
                    </div>
                </div>


                <div className="pt-5">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !formData.noCriminalRecord || !formData.agreedToTerms}
                            className="w-full sm:w-auto flex justify-center py-2 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save Private Information'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivateInfoEditor;