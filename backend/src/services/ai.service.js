import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1', // Using OpenRouter for Meta-Llama, can be changed to default OpenAI
});
export const analyzeResume = async (resumeText) => {
    const prompt = `
    You are an expert AI Resume Screener and Career Advisor.
    Analyze the following resume text.
    Provide a detailed JSON response strictly following this structure:
    {
        "score": <0-100 integer>,
        "ats_compatibility": <0-100 integer>,
        "strengths": [<list of strings>],
        "weaknesses": [<list of strings>],
        "skill_gaps": [<list of strings>],
        "suggestions": [<list of strings>],
        "roadmap": {
            "0-3 months": [<list of strings>],
            "3-6 months": [<list of strings>],
            "6-12 months": [<list of strings>]
        }
    }
    
    Resume Text:
    ${resumeText.substring(0, 4000)} // Truncate to avoid token limits if necessary
  `;
    try {
        const response = await openai.chat.completions.create({
            model: "meta-llama/llama-3.3-70b-instruct:free",
            messages: [
                { role: "system", content: "You output only structured JSON." },
                { role: "user", content: prompt }
            ],
            temperature: 0.2
        });
        const content = response.choices[0]?.message?.content || '{}';
        // Extract JSON using regex in case model adds surrounding text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Invalid JSON format from AI');
    }
    catch (error) {
        console.error('AI Analysis Error:', error);
        // Fallback response for development if API fails
        return {
            "score": 85,
            "ats_compatibility": 80,
            "strengths": ["Software Development", "Teamwork"],
            "weaknesses": ["Cloud Platforms"],
            "skill_gaps": ["AWS", "Docker"],
            "suggestions": ["Add more quantifiable metrics to your experience section."],
            "roadmap": {
                "0-3 months": ["Learn Docker basics"],
                "3-6 months": ["Learn AWS fundamentals"],
                "6-12 months": ["Deploy scalable applications"]
            }
        };
    }
};
//# sourceMappingURL=ai.service.js.map