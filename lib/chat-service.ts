import supabase from './utils/supabase';

export type ChatMessage = {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt?: string;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
};

export const chatService = {
  async createChatSession(userId: string, title: string = 'New Chat'): Promise<string | null> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{ user_id: userId, title }])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
    
    return data.id;
  },
  
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        title,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
    
    const sessionsWithLastMessage = await Promise.all(
      data.map(async (session: any) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('content, role')
          .eq('session_id', session.id)
          .eq('role', 'user')
          .order('created_at', { ascending: false })
          .limit(1);
        
        return {
          id: session.id,
          title: session.title,
          createdAt: session.created_at,
          updatedAt: session.updated_at,
          lastMessage: messages && messages.length > 0 ? messages[0].content.substring(0, 30) : ''
        };
      })
    );
    
    return sessionsWithLastMessage;
  },
  
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('id, content, role, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
    
    return data.map((message: any) => ({
      id: message.id,
      content: message.content,
      role: message.role,
      createdAt: message.created_at
    }));
  },
  
  async addChatMessage(sessionId: string, userId: string, content: string, role: 'user' | 'assistant'): Promise<string | null> {
    
    const { data, error } = await supabase
      .from('messages')
      .insert([{ 
        session_id: sessionId, 
        user_id: userId,
        content, 
        role 
      }])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error adding chat message:', error);
      return null;
    }
    
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);
    
    return data.id;
  },
  
  async migrateLocalChats(userId: string, localChats: { sessionId: string, messages: ChatMessage[] }[]): Promise<void> {
    for (const localChat of localChats) {
      const sessionTitle = localChat.messages.length > 0 
        ? localChat.messages[0].content.substring(0, 30) 
        : 'Imported Chat';
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ 
          user_id: userId, 
          title: sessionTitle 
        }])
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating session for local chat:', error);
        continue;
      }
      
      const newSessionId = data.id;
      
      for (const message of localChat.messages) {
        await supabase
          .from('messages')
          .insert([{
            session_id: newSessionId,
            user_id: userId,
            content: message.content,
            role: message.role
          }]);
      }
    }
  },
  // Add this function to your chat-service.ts
  async deleteChatSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      // First delete all messages in the session
      console.log('Deletion parameters:', {
        sessionId, 
        userId, 
        sessionIdType: typeof sessionId,
        userIdType: typeof userId
      });
      
      // Then also query to confirm the record exists
      const { data: sessionCheck, error: sessionCheckError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId);

      console.log('Session Check Details:', {
        sessionCheckData: sessionCheck,
        sessionCheckError,
        sessionCheckLength: sessionCheck?.length,
        sessionCheckFirstItem: sessionCheck?.[0]
      });

      const { data: messageCheck, error: messageCheckError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId);

      console.log('Message Check Details:', {
        messageCheckData: messageCheck,
        messageCheckError,
        messageCheckLength: messageCheck?.length,
        messageCheckFirstItem: messageCheck?.[0]
      });

      const { data: messageDeleteData, error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .select();

      console.log('Detailed Message Deletion:', {
        messageDeleteData,
        messagesError,
        messageCount: messageDeleteData?.length,
        sessionId,
        userId
      });
      
      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        return false;
      }
      
      // Then delete the session itself
      const { data: sessionDeleteData, error: sessionError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select();
    
      console.log('Session deletion result:', { 
        sessionDeleteData, 
        sessionError,
        sessionCount: sessionDeleteData?.length 
      });
      
      if (sessionError) {
        console.error('Error deleting session:', sessionError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete chat session:', error);
      return false;
    }
  }

};