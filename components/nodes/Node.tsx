import { useState, useRef, KeyboardEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { NodeType } from '@/types';

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
        .select('*, links(count)')
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
    // Implement indentation logic similar to server.js:95-140
  }

  async function outdentNode() {
    // Implement outdentation logic similar to server.js:142-220
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