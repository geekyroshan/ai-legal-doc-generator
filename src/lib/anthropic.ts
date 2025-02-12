import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client with browser support
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateDocument(template: any, formData: Record<string, string>) {
  console.log('Starting document generation...');
  try {
    const response = await Promise.race([
      anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Generate a legal document based on this template: ${template.title}
          Template content: ${template.content}
          User inputs: ${JSON.stringify(formData, null, 2)}
          
          Please generate a professional and complete legal document incorporating all the provided information.`
        }]
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
      )
    ]);

    console.log('API Response received:', response);
    return response.content[0].text;
  } catch (error) {
    console.error('Error in generateDocument:', error);
    throw error;
  }
}