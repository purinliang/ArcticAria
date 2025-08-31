DROP TABLE IF EXISTS comments;

CREATE TABLE comments (    
  id TEXT PRIMARY KEY, 
  post_id TEXT NOT NULL,     
  user_id TEXT NOT NULL,   
  parent_comment_id TEXT,   
  content TEXT NOT NULL,   
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,    
  updated_at TIMESTAMP WITH TIME ZONE,    
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,   
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, 
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE SET NULL
);