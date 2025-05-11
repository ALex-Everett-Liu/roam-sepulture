import './App.css'
import NodeTree from './components/nodes/NodeTree'
import LanguageToggle from './components/ui/LanguageToggle'
import { LanguageProvider } from './lib/hooks/useLanguage'
import { useState } from 'react'
import { supabase } from './lib/supabase/client'

function App() {
  const [triggerRefresh, setTriggerRefresh] = useState(0)
  
  const handleAddRootNode = async () => {
    try {
      // Get count of existing root nodes for position
      const { count } = await supabase
        .from('nodes')
        .select('*', { count: 'exact', head: true })
        .is('parent_id', null);
      
      // Insert new node
      const { error } = await supabase
        .from('nodes')
        .insert({
          content: 'New node',
          content_zh: '新节点',
          parent_id: null,
          position: count || 0,
          is_expanded: true
        })
        .select();
      
      if (error) throw error;
      
      // Trigger refresh
      setTriggerRefresh(prev => prev + 1);
    } catch (error) {
      console.error('Error adding root node:', error);
    }
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
            <button 
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleAddRootNode}
            >
              Add Root Node
            </button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <NodeTree refreshTrigger={triggerRefresh} />
          </div>
        </main>
      </div>
    </LanguageProvider>
  )
}

export default App
