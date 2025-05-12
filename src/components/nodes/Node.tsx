import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useLanguage } from '../../lib/hooks/useLanguage';
import type { NodeType } from '../../types';

type NodeProps = {
  node: NodeType;
};

export default function Node({ node }: NodeProps) {
  const { language } = useLanguage();
  const [children, setChildren] = useState<NodeType[]>([]);
  const [expanded, setExpanded] = useState(node.is_expanded);
  const [loading, setLoading] = useState(false);
  const [childrenLoaded, setChildrenLoaded] = useState(false);
  const nodeTextRef = useRef<HTMLDivElement>(null);

  async function toggleExpand() {
    setExpanded(!expanded);
    
    if (!childrenLoaded) {
      await fetchChildren();
      setChildrenLoaded(true);
    }
    
    // Update expansion state in database
    await supabase
      .from('nodes')
      .update({ is_expanded: !expanded })
      .eq('id', node.id);
  }

  async function fetchChildren() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nodes')
        .select('*, links!links_from_node_id_fkey(count)')
        .eq('parent_id', node.id)
        .order('position');

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error(`Error fetching children for node ${node.id}:`, error);
    } finally {
      setLoading(false);
    }
  }

  async function handleContentChange() {
    if (!nodeTextRef.current) return;
    
    const content = nodeTextRef.current.textContent || '';
    // Determine which field to update based on current language
    const updateData = language === 'en' 
      ? { content } 
      : { content_zh: content };
      
    await supabase
      .from('nodes')
      .update(updateData)
      .eq('id', node.id);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChildNode();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Outdent
        outdentNode();
      } else {
        // Indent
        indentNode();
      }
    }
  }

  async function addChildNode() {
    try {
      // Fetch existing children to determine position
      const { data: existingChildren } = await supabase
        .from('nodes')
        .select('id')
        .eq('parent_id', node.id);
        
      const position = existingChildren?.length || 0;
        
      // Insert new node
      const { data, error } = await supabase
        .from('nodes')
        .insert({
          content: 'New node',
          content_zh: '新节点',
          parent_id: node.id,
          position,
          is_expanded: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Make sure parent is expanded
      setExpanded(true);
      
      // If children are already loaded, add the new node
      if (childrenLoaded) {
        setChildren([...children, data]);
      } else {
        await fetchChildren();
        setChildrenLoaded(true);
      }
    } catch (error) {
      console.error('Error adding child node:', error);
    }
  }

  async function indentNode() {
    try {
      // Can't indent a node with no parent and position 0
      if (!node.parent_id && node.position === 0) {
        console.error('Cannot indent the first root node');
        return;
      }

      // Find the node directly above the current node
      let { data: nodeAbove, error: nodeAboveError } = node.parent_id
        ? await supabase
            .from('nodes')
            .select('*')
            .eq('parent_id', node.parent_id)
            .lt('position', node.position)
            .order('position', { ascending: false })
            .limit(1)
            .single()
        : await supabase
            .from('nodes')
            .select('*')
            .is('parent_id', null)
            .lt('position', node.position)
            .order('position', { ascending: false })
            .limit(1)
            .single();

      if (nodeAboveError || !nodeAbove) {
        console.error('No node above to make parent');
        return;
      }

      // Get the position this node will have in the new parent
      const { data: existingChildren } = await supabase
        .from('nodes')
        .select('id')
        .eq('parent_id', nodeAbove.id);
      
      const newPosition = existingChildren?.length || 0;

      // Begin database operations - ideally would use transactions
      
      // 1. Update positions of nodes in the old parent
      if (node.parent_id) {
        await supabase
          .from('nodes')
          .update({ position: node.position })
          .eq('parent_id', node.parent_id)
          .gt('position', node.position)
          .select('id, position')
          .then(({data}) => {
            if (data && data.length > 0) {
              const updates = data.map((n) => ({
                id: n.id,
                position: (n.position as number) - 1
              }));
              
              return supabase.from('nodes').upsert(updates);
            }
          });
      } else {
        await supabase
          .from('nodes')
          .update({ position: node.position })
          .is('parent_id', null)
          .gt('position', node.position)
          .select('id, position')
          .then(({data}) => {
            if (data && data.length > 0) {
              const updates = data.map((n) => ({
                id: n.id,
                position: (n.position as number) - 1
              }));
              
              return supabase.from('nodes').upsert(updates);
            }
          });
      }

      // 2. Update the node's parent_id and position
      await supabase
        .from('nodes')
        .update({
          parent_id: nodeAbove.id,
          position: newPosition,
        })
        .eq('id', node.id);

      // 3. Make sure the new parent is expanded
      await supabase
        .from('nodes')
        .update({ is_expanded: true })
        .eq('id', nodeAbove.id);

      // Refresh UI
      // This is a simplified approach - ideally we would use a more sophisticated
      // state management approach to update the UI without a full refresh
      window.location.reload();
      
    } catch (error) {
      console.error('Error indenting node:', error);
    }
  }

  async function outdentNode() {
    try {
      // Can't outdent a root node
      if (!node.parent_id) {
        console.error('Cannot outdent a root node');
        return;
      }

      // Get the parent node
      const { data: parentNode, error: parentError } = await supabase
        .from('nodes')
        .select('*')
        .eq('id', node.parent_id)
        .single();

      if (parentError || !parentNode) {
        console.error('Parent node not found');
        return;
      }

      // Determine the new position in the grandparent context
      let newPosition;
      
      if (parentNode.parent_id) {
        // If the parent has a parent (i.e., not a root node)
        const { data: siblings, error: siblingsError } = await supabase
          .from('nodes')
          .select('position')
          .eq('parent_id', parentNode.parent_id)
          .gt('position', parentNode.position)
          .order('position', { ascending: true })
          .limit(1);

        if (siblingsError) {
          console.error('Error getting siblings:', siblingsError);
          return;
        }

        newPosition = siblings && siblings.length > 0 
          ? siblings[0].position // Position right before the next sibling
          : parentNode.position + 1; // Position right after parent
      } else {
        // If the parent is a root node
        const { data: rootNodes, error: rootNodesError } = await supabase
          .from('nodes')
          .select('position')
          .is('parent_id', null)
          .gt('position', parentNode.position)
          .order('position', { ascending: true })
          .limit(1);

        if (rootNodesError) {
          console.error('Error getting root nodes:', rootNodesError);
          return;
        }

        newPosition = rootNodes && rootNodes.length > 0 
          ? rootNodes[0].position // Position right before the next root node
          : parentNode.position + 1; // Position right after parent
      }

      // Begin database operations
      
      // 1. Update positions of siblings in the old parent
      await supabase
        .from('nodes')
        .update({ position: node.position })
        .eq('parent_id', node.parent_id)
        .gt('position', node.position)
        .select('id, position')
        .then(({data}) => {
          if (data && data.length > 0) {
            const updates = data.map((n) => ({
              id: n.id,
              position: (n.position as number) - 1
            }));
            
            return supabase.from('nodes').upsert(updates);
          }
        });

      // 2. Update positions in the new parent context to make room
      if (parentNode.parent_id) {
        await supabase
          .from('nodes')
          .update({ position: newPosition })
          .eq('parent_id', parentNode.parent_id)
          .gte('position', newPosition)
          .select('id, position')
          .then(({data}) => {
            if (data && data.length > 0) {
              const updates = data.map((n) => ({
                id: n.id,
                position: (n.position as number) + 1
              }));
              
              return supabase.from('nodes').upsert(updates);
            }
          });
      } else {
        await supabase
          .from('nodes')
          .update({ position: newPosition })
          .is('parent_id', null)
          .gte('position', newPosition)
          .select('id, position')
          .then(({data}) => {
            if (data && data.length > 0) {
              const updates = data.map((n) => ({
                id: n.id,
                position: (n.position as number) + 1
              }));
              
              return supabase.from('nodes').upsert(updates);
            }
          });
      }

      // 3. Update the node's parent_id and position
      await supabase
        .from('nodes')
        .update({
          parent_id: parentNode.parent_id,
          position: newPosition,
        })
        .eq('id', node.id);

      // Refresh UI
      window.location.reload();
      
    } catch (error) {
      console.error('Error outdenting node:', error);
    }
  }

  const displayContent = language === 'en' 
    ? node.content 
    : node.content_zh || node.content;

  return (
    <div className="node ml-4 my-1">
      <div className="flex items-start">
        <div className="flex items-center mr-2">
          {loading ? (
            <div className="w-4 h-4 animate-pulse bg-gray-200 rounded-full"></div>
          ) : children.length > 0 || !childrenLoaded ? (
            <button onClick={toggleExpand} className="w-4 h-4 text-gray-500">
              {expanded ? '▼' : '►'}
            </button>
          ) : (
            <span className="w-4 h-4 text-gray-400">•</span>
          )}
        </div>
        
        <div
          ref={nodeTextRef}
          contentEditable
          suppressContentEditableWarning
          className="flex-grow p-1 focus:outline-none focus:bg-blue-50 rounded"
          onBlur={handleContentChange}
          onKeyDown={handleKeyDown}
        >
          {displayContent}
        </div>
        
        <div className="flex space-x-1 ml-2">
          <button 
            className="p-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
            onClick={addChildNode}
            title="Add child node"
          >
            +
          </button>
          <button 
            className="p-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
            onClick={() => {}}
            title="Link to node"
          >
            🔗
          </button>
        </div>
      </div>
      
      {expanded && childrenLoaded && (
        <div className="children pl-4 border-l border-gray-200">
          {children.map(childNode => (
            <Node key={childNode.id} node={childNode} />
          ))}
        </div>
      )}
    </div>
  );
}