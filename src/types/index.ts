export interface NodeType {
    id: string;
    content: string;
    content_zh?: string;
    parent_id: string | null;
    position: number;
    is_expanded: boolean;
    has_markdown?: boolean;
    link_count?: number;
  }