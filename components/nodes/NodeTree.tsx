import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Node from './Node';
import { NodeType } from '../../types';

export default function NodeTree() {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRootNodes();
  }, []);

  async function fetchRootNodes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nodes')
        .select('*, links(count)')
        .is('parent_id', null)
        .order('position');

      if (error) throw error;
      setNodes(data || []);
    } catch (error) {
      console.error('Error fetching nodes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addRootNode() {
    try {
      // Get count of existing root nodes for position
      const { count } = await supabase
        .from('nodes')
        .select('*', { count: 'exact', head: true })
        .is('parent_id', null);
      
      // Insert new node
      const { data, error } = await supabase
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
      
      // Refresh the list
      fetchRootNodes();
    } catch (error) {
      console.error('Error adding root node:', error);
    }
  }

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {nodes.map(node => (
            <Node key={node.id} node={node} />
          ))}
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => addRootNode()}
          >
            Add Root Node
          </button>
        </div>
      )}
    </div>
  );
}