import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ContentOverrides } from '../types';
import * as api from '../services/supabase';

// Defines the structure for all editable content on the site
type ContentState = ContentOverrides;

interface ContentContextType {
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  content: ContentState;
  loadingContent: boolean;
  updateText: (id: string, value: string) => void;
  updateNumber: (id: string, value: number) => void;
  updateAsset: (id: string, value: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const defaultContent: ContentState = {
    text: {},
    numbers: {},
    assets: {}
};

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [content, setContent] = useState<ContentState>(defaultContent);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
        try {
            const data = await api.getContentOverrides();
            setContent(data);
        } catch (error) {
            console.error("Failed to fetch content overrides:", error);
        } finally {
            setLoadingContent(false);
        }
    };
    fetchContent();
  }, []);

  const updateContent = useCallback(async (newContent: ContentState) => {
    setContent(newContent); // Optimistic update
    try {
      await api.updateContentOverrides(newContent);
    } catch (error) {
      console.error("Failed to save content to API", error);
      // Here you might want to add error handling, e.g., revert the state
    }
  }, []);

  const updateText = (id: string, value: string) => {
    const newContent = { ...content, text: { ...content.text, [id]: value } };
    updateContent(newContent);
  };
  
  const updateNumber = (id: string, value: number) => {
    const newContent = { ...content, numbers: { ...content.numbers, [id]: value } };
    updateContent(newContent);
  };
  
  const updateAsset = (id: string, value: string) => {
    const newContent = { ...content, assets: { ...content.assets, [id]: value } };
    updateContent(newContent);
  };

  const value = {
      isEditMode,
      setIsEditMode,
      content,
      loadingContent,
      updateText,
      updateNumber,
      updateAsset
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};