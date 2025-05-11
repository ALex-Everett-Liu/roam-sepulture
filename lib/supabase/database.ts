import { supabase } from './client';

// Get root nodes
export async function getRootNodes(language = 'en') {
  const query = supabase
    .from('nodes')
    .select(`
      id, 
      ${language === 'en' ? 'content' : 'content_zh'} as content, 
      parent_id, 
      position, 
      is_expanded,
      links(count)
    `)
    .is('parent_id', null)
    .order('position');
    
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

// Get children of a node
export async function getChildNodes(nodeId: string, language = 'en') {
  const query = supabase
    .from('nodes')
    .select(`
      id, 
      ${language === 'en' ? 'content' : 'content_zh'} as content, 
      parent_id, 
      position, 
      is_expanded,
      links(count)
    `)
    .eq('parent_id', nodeId)
    .order('position');
    
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

// Add more database helper functions
export async function updateNodeContent(nodeId: string, content: string, language = 'en') {
  const updateData = language === 'en' 
    ? { content } 
    : { content_zh: content };
    
  const { data, error } = await supabase
    .from('nodes')
    .update(updateData)
    .eq('id', nodeId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export default {
  getRootNodes,
  getChildNodes,
  updateNodeContent
};