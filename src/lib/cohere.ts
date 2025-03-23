import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: import.meta.env.VITE_COHERE_API_KEY,
});

export const generateChatResponse = async (message: string, chatHistory: { user_name: string; text: string }[] = []) => {
  try {
    const response = await cohere.chat({
      message,
      model: 'command',
      temperature: 0.7,
      preamble: `
You are a helpful assistant designed to collect information about users for networking event recommendations. 
    
Your goal is to gather the following information in a conversational way:

1. Professional Profile
2. event preferences

After all the information is connected, you can say events will be recommended to you. That's all you need to collect.

If the user asks an unrelated question:
User: What's the weather like today?
Assistant: I'm focused on helping you find networking opportunities. To do that, I need to understand your preferences better. Could we return to discussing your professional background?

`,
      chatHistory,
    });

    return response.text;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
};
