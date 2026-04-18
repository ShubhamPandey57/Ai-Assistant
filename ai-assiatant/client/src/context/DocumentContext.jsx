import { createContext, useContext, useState, useCallback } from 'react';
import * as documentApi from '../api/document.api';

const DocumentContext = createContext(null);

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentApi.getDocuments();
      setDocuments(res.data.documents);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await documentApi.uploadDocument(formData);
    setDocuments(prev => [res.data.document, ...prev]);
    return res.data.document;
  };

  const deleteDocument = async (id) => {
    await documentApi.deleteDocument(id);
    setDocuments(prev => prev.filter(d => d._id !== id));
  };

  return (
    <DocumentContext.Provider value={{ documents, loading, fetchDocuments, uploadDocument, deleteDocument }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => useContext(DocumentContext);
