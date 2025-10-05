import React, { useRef, useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { PencilIcon } from './Icons';

type EditableProps = {
  editId: string;
  className?: string;
} & (
  // FIX: Replaced `keyof JSX.IntrinsicElements` with `React.ElementType` to resolve "Cannot find namespace 'JSX'" error. This is a more robust type that is available directly from the React import.
  | { type: 'text'; defaultValue: string; as?: React.ElementType }
  | { type: 'number'; defaultValue: number; prefix?: string }
  | { type: 'asset'; defaultValue: React.ReactNode }
);

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]); // Return only the base64 part
            } else {
                reject(new Error('Failed to convert blob to base64 string'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const Editable: React.FC<EditableProps> = (props) => {
  const { isEditMode, content, updateText, updateNumber, updateAsset } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const overrideValue = 
    props.type === 'text' ? content.text[props.editId] :
    props.type === 'number' ? content.numbers[props.editId] :
    props.type === 'asset' ? content.assets[props.editId] :
    undefined;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && props.type === 'asset') {
        const base64 = await blobToBase64(file);
        updateAsset(props.editId, base64);
    }
  };

  const renderValue = () => {
    switch (props.type) {
      case 'text':
        const Tag = props.as || 'span';
        return <Tag>{overrideValue ?? props.defaultValue}</Tag>;
      case 'number':
        return <span>{props.prefix}{ (overrideValue ?? props.defaultValue).toLocaleString('id-ID')}</span>;
      case 'asset':
        if (overrideValue) {
            return <img src={`data:image/png;base64,${overrideValue}`} className="w-full h-full object-contain" alt="custom asset" />;
        }
        return props.defaultValue;
      default:
        return null;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
      if (props.type === 'text') {
        updateText(props.editId, e.currentTarget.textContent || '');
      }
      setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
      }
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (props.type === 'number') {
        updateNumber(props.editId, Number(e.target.value));
      }
  };

  if (!isEditMode) {
    return <div className={props.className}>{renderValue()}</div>;
  }

  return (
    <div
      className={`relative group border-2 border-dashed border-transparent hover:border-orange-400 p-1 rounded-md transition-all ${props.className}`}
      onClick={() => {
        if (props.type === 'text' || props.type === 'number') setIsEditing(true);
        if (props.type === 'asset') fileInputRef.current?.click();
      }}
    >
      <div className="absolute -top-2 -right-2 z-10 bg-orange-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg">
        <PencilIcon className="w-3 h-3" />
      </div>

      {isEditing && props.type === 'text' && (
        <span
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-100"
            autoFocus
        >
          {overrideValue ?? props.defaultValue}
        </span>
      )}
      
      {isEditing && props.type === 'number' && (
          <div className="flex items-center">
            {props.prefix && <span>{props.prefix}</span>}
            <input
                type="number"
                value={overrideValue ?? props.defaultValue}
                onChange={handleNumberChange}
                onBlur={() => setIsEditing(false)}
                onKeyDown={handleKeyDown}
                className="w-full focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-100"
                autoFocus
            />
          </div>
      )}
      
      {!isEditing && renderValue()}

      {props.type === 'asset' && (
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      )}
    </div>
  );
};