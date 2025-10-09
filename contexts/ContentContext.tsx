import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
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
            // Use functional update to ensure we don't have stale state.
            setContent(current => ({ ...current, ...data }));
        } catch (error) {
            console.error("Failed to fetch content overrides:", error);
        } finally {
            setLoadingContent(false);
        }
    };
    fetchContent();
  }, []);

  // Central function to update state and save to backend.
  const updateAndSaveContent = useCallback(async (getNewContent: (currentContent: ContentState) => ContentState) => {
    // We get the new content first for the API call
    let newContent: ContentState | null = null;
    
    // Use functional update for React state to avoid race conditions from rapid updates.
    setContent(currentContent => {
        newContent = getNewContent(currentContent);
        return newContent;
    });

    try {
      if (newContent) { // Ensure newContent was set before calling API
          await api.updateContentOverrides(newContent);
      }
    } catch (error) {
      console.error("Failed to save content to API", error);
      // In a production app, you might want to revert the optimistic UI update here.
      // For simplicity, we'll just log the error.
    }
  }, []);

  const updateText = useCallback((id: string, value: string) => {
    updateAndSaveContent(currentContent => ({
        ...currentContent,
        text: { ...(currentContent.text || {}), [id]: value }
    }));
  }, [updateAndSaveContent]);
  
  const updateNumber = useCallback((id: string, value: number) => {
    updateAndSaveContent(currentContent => ({
        ...currentContent,
        numbers: { ...(currentContent.numbers || {}), [id]: value }
    }));
  }, [updateAndSaveContent]);
  
  const updateAsset = useCallback((id: string, value: string) => {
    updateAndSaveContent(currentContent => ({
        ...currentContent,
        assets: { ...(currentContent.assets || {}), [id]: value }
    }));
  }, [updateAndSaveContent]);

  // Memoize the context value to prevent unnecessary re-renders of consumers.
  const value = useMemo(() => ({
      isEditMode,
      setIsEditMode,
      content,
      loadingContent,
      updateText,
      updateNumber,
      updateAsset
  }), [isEditMode, content, loadingContent, updateText, updateNumber, updateAsset]);

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