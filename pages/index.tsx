// pages/index.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import NodeTree from '@/components/nodes/NodeTree';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { LanguageProvider } from '@/lib/hooks/useLanguage';

export default function Home() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAndInitializeDatabase() {
      try {
        // Check if there are any nodes
        const { count, error: countError } = await supabase
          .from('nodes')
          .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;
        
        // If no nodes exist, create a default root node
        if (count === 0) {
          const { error: insertError } = await supabase
            .from('nodes')
            .insert({
              content: 'Welcome to roam-sepulture',
              content_zh: '欢迎使用 roam-sepulture',
              position: 0,
              is_expanded: true
            });
          
          if (insertError) throw insertError;
        }
        
        setInitialized(true);
      } catch (err: unknown) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    }
    
    checkAndInitializeDatabase();
  }, []);

  if (error) {
    return <div className="flex justify-center items-center h-screen">
      <div className="p-6 bg-red-100 text-red-700 rounded-lg">
        <h2 className="text-xl font-bold">Error initializing application</h2>
        <p>{error}</p>
      </div>
    </div>;
  }

  if (!initialized) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>;
  }

  return (
    <LanguageProvider>
      <div className="flex flex-col h-screen">
        <header className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">roam-sepulture</h1>
          <LanguageToggle />
        </header>
        
        <main className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r p-4">
            {/* Sidebar */}
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add Root Node
            </button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <NodeTree />
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
}