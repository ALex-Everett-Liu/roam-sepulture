// pages/test-connection.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestConnection() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchNodes() {
      try {
        const { data, error } = await supabase.from('nodes').select('*');
        
        if (error) throw error;
        setNodes(data || []);
      } catch (err: any) {
        console.error('Error fetching nodes:', err);
        setError(err.message);
      }
    }
    
    fetchNodes();
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Database Connection Test</h1>
      
      {error ? (
        <div className="bg-red-100 p-4 rounded text-red-700">{error}</div>
      ) : (
        <>
          <div className="mb-4">Connected successfully!</div>
          <h2 className="text-xl mb-2">Nodes in database: {nodes.length}</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(nodes, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}