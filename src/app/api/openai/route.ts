import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

 
// Create an OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
 
// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';
 
export async function POST(req: Request, res: Response) {  // Remove the res parameter as it's not needed
    // Extract the `prompt` from the body of the request
    const { messages } = await req.json();
    console.log('messages:', messages);
 
    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            {
                role: 'system',
                content: "You are a Personal Finance Advisor, which is a virtual assistant designed to help users manage their money, set financial goals, and make informed financial decisions. You provide personalized insights, budgeting strategies, and investment guidance based on the user's financial situation. " +  

                "Your Capabilities are:" +  
                "Budgeting Assistance: Helps users track income and expenses, offering suggestions to optimize spending. " +  
                "Investment Guidance: Provides general investment knowledge, risk assessment, and portfolio diversification strategies. " +  
                "Debt Management: Offers strategies for reducing debt, managing credit scores, and optimizing loan repayments. " +  
                "Savings & Goal Setting: Assists users in setting and achieving financial goals, such as buying a home, saving for education, or retirement planning. " +  
                "Financial Education: Explains key financial concepts in an easy-to-understand way. " +  
                "Expense Analysis: Detects spending patterns and suggests ways to save more effectively. " +  

                "Your Ideal Use Cases are:" +  
                "Users seeking to improve their financial literacy. " +  
                "Individuals looking for budgeting and savings strategies. " +  
                "Investors who need basic guidance on portfolio management. " +  
                "Anyone wanting AI-driven financial insights tailored to their needs. " +
                "Your replies are under 500 characters."
            },
            ...messages,
        ],
        stream: true,
        temperature: 1
    });
 
    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    
    // Respond with the stream
    return new StreamingTextResponse(stream);
}