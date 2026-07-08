import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;
let activeModel = "gemini-1.5-flash"; // default fallback

let availableModelNames: string[] = [];

export const initializeAI = async () => {
  console.log("=== AI SERVICE STARTUP VALIDATION ===");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set in environment.");
    return;
  }
  
  console.log("✅ GEMINI_API_KEY is present.");
  
  try {
    genAI = new GoogleGenAI({ apiKey });
    const modelsResponse = await genAI.models.list();
    const modelsList: any[] = [];
    for await (const m of modelsResponse) {
      modelsList.push(m);
    }
    availableModelNames = modelsList.map((m: any) => m.name);
    
    console.log(`✅ Fetched ${availableModelNames.length} available models.`);
    
    const configuredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const targetModelName = 'models/' + configuredModel;
    
    const targetModelObj = modelsList.find((m: any) => m.name === targetModelName || m.name === configuredModel);
    
    if (targetModelObj && targetModelObj.supportedActions?.includes('generateContent')) {
      activeModel = configuredModel;
      console.log(`✅ Configured model '${configuredModel}' is fully supported.`);
    } else {
      console.warn(`⚠️ Configured model '${configuredModel}' is unavailable or unsupported.`);
      
      // Fallback logic
      const preferredFallbacks = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let fallbackFound = false;
      for (const fallback of preferredFallbacks) {
        const fallbackObj = modelsList.find((m: any) => m.name === 'models/' + fallback);
        if (fallbackObj && fallbackObj.supportedActions?.includes('generateContent')) {
          activeModel = fallback;
          fallbackFound = true;
          break;
        }
      }
      
      if (!fallbackFound) {
        const anyFlash = modelsList.find((m: any) => m.name.includes('flash') && m.supportedActions?.includes('generateContent'));
        if (anyFlash) {
          activeModel = anyFlash.name.replace('models/', '');
        }
      }
      
      console.log(`🔄 Automatically fell back to supported model: '${activeModel}'`);
    }
  } catch (error: any) {
    console.error("❌ AI Initialization Failed:", error.message);
  }
  
  console.log("=======================================");
};

const checkGenAI = () => {
  if (!genAI) {
    throw new Error(`AI Service is not initialized properly. API Key missing or invalid. Check startup logs.`);
  }
}

const generateWithFallback = async (options: any): Promise<any> => {
  const fallbacks = [activeModel, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError: any;

  for (const model of fallbacks) {
    try {
      if (!availableModelNames.includes('models/' + model) && model !== activeModel) continue;
      
      return await genAI!.models.generateContent({
        ...options,
        model: model
      });
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️ Model '${model}' failed: ${error?.message}. Retrying with next fallback...`);
    }
  }

  const configuredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  throw new Error(
    `[Exact Reason: ${lastError?.message}] | [Configured: ${configuredModel}] | [Available Models: ${availableModelNames.join(', ')}]`
  );
};

export const analyzeResume = async (resumeText: string): Promise<any> => {
  const prompt = `
    Analyze the following resume text and provide a detailed JSON response.
    Structure: { "score": 0-100, "ats_compatibility": 0-100, "strengths": ["string"], "weaknesses": ["string"], "skill_gaps": ["string"], "suggestions": ["string"], "roadmap": { "0-3 months": ["string"], "3-6 months": ["string"], "6-12 months": ["string"] } }
    Resume Text: ${resumeText.substring(0, 4000)}
  `;
  try {
    checkGenAI();
    const result = await generateWithFallback({
        contents: prompt,
        config: { temperature: 0.2, responseMimeType: 'application/json' }
    });
    return JSON.parse(result.text || '{}');
  } catch (error: any) {
    console.error('AI Analysis Error:', error?.message || error);
    throw new Error('AI Analysis failed. Details: ' + (error?.message || 'Unknown error'));
  }
};

export const compareResumeWithJD = async (resumeText: string, jdText: string): Promise<any> => {
  const prompt = `
    Compare the following Resume against the Job Description (JD).
    Structure: { "match_percentage": 0-100, "missing_keywords": ["string"], "matching_skills": ["string"], "recommendations": ["string"], "suitability_summary": "string" }
    Resume: ${resumeText.substring(0, 3000)}
    JD: ${jdText.substring(0, 3000)}
  `;
  try {
    checkGenAI();
    const result = await genAI!.models.generateContent({
        model: activeModel,
        contents: prompt,
        config: { temperature: 0.2, responseMimeType: 'application/json' }
    });
    return JSON.parse(result.text || '{}');
  } catch (error: any) {
    console.error('JD Analysis Error:', error?.message || error);
    throw new Error('JD Analysis failed: ' + (error?.message || 'Unknown error') + ` (Model: ${activeModel})`);
  }
};

// --- HELPER: Build LaTeX from structured data ---
function buildLatex(data: any): string {
  const esc = (s: string) => s?.replace(/[&%$#_{}~^\\]/g, (m: string) => {
    const map: Record<string, string> = { '&': '\\&', '%': '\\%', '$': '\\$', '#': '\\#', '_': '\\_', '{': '\\{', '}': '\\}', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}', '\\': '\\textbackslash{}' };
    return map[m] || m;
  }) || '';

  const name = esc(data.name || 'Your Name');
  const phone = esc(data.phone || '');
  const email = data.email || '';
  const linkedin = data.linkedin || '';
  const github = data.github || '';
  const location = esc(data.location || '');

  let header = `\\begin{center}\n    \\textbf{\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}\n    \\small`;
  const contactParts: string[] = [];
  if (phone) contactParts.push(phone);
  if (email) contactParts.push(`\\href{mailto:${email}}{\\underline{${esc(email)}}}`);
  if (location) contactParts.push(location);
  if (linkedin) contactParts.push(`\\href{${linkedin}}{\\underline{linkedin.com/in/${esc(data.linkedin_user || 'user')}}}`);
  if (github) contactParts.push(`\\href{${github}}{\\underline{github.com/${esc(data.github_user || 'user')}}}`);
  header += ' ' + contactParts.join(' $|$ ');
  header += '\n\\end{center}';

  // Education
  let education = '\\section{Education}\n  \\resumeSubHeadingListStart\n';
  for (const edu of (data.education || [])) {
    education += `    \\resumeSubheading\n      {${esc(edu.school)}}{${esc(edu.location)}}\n      {${esc(edu.degree)}}{${esc(edu.date)}}\n`;
  }
  education += '  \\resumeSubHeadingListEnd\n';

  // Experience
  let experience = '\\section{Experience}\n  \\resumeSubHeadingListStart\n';
  for (const exp of (data.experience || [])) {
    experience += `\n    \\resumeSubheading\n      {${esc(exp.title)}}{${esc(exp.date)}}\n      {${esc(exp.company)}}{${esc(exp.location)}}\n      \\resumeItemListStart\n`;
    for (const item of (exp.items || [])) {
      experience += `        \\resumeItem{${esc(item)}}\n`;
    }
    experience += `      \\resumeItemListEnd\n`;
  }
  experience += '  \\resumeSubHeadingListEnd\n';

  // Projects
  let projects = '\\section{Projects}\n    \\resumeSubHeadingListStart\n';
  for (const proj of (data.projects || [])) {
    projects += `      \\resumeProjectHeading\n          {\\textbf{${esc(proj.name)}} $|$ \\emph{${esc(proj.tech)}}}{${esc(proj.date)}}\n          \\resumeItemListStart\n`;
    for (const item of (proj.items || [])) {
      projects += `            \\resumeItem{${esc(item)}}\n`;
    }
    projects += `          \\resumeItemListEnd\n`;
  }
  projects += '    \\resumeSubHeadingListEnd\n';

  // Skills
  let skills = '\\section{Technical Skills}\n \\begin{itemize}[leftmargin=0.15in, label={}]\n    \\small{\\item{\n';
  for (const skill of (data.skills || [])) {
    skills += `     \\textbf{${esc(skill.category)}}{: ${esc(skill.items)}} \\\\\n`;
  }
  // Remove trailing \\
  skills = skills.replace(/\\\\\n$/, '\n');
  skills += '    }}\n \\end{itemize}\n';

  return `%-------------------------
% Resume in Latex
% Author : Generated by CareerSync AI
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

${header}

${education}
${experience}
${projects}
${skills}
\\end{document}
`;
}

export const tailorResume = async (resumeText: string, jdText: string): Promise<any> => {
  const prompt = `
You are an expert AI Resume Writer. Extract and optimize the resume data to match the Job Description.

Return a JSON object with this EXACT structure:
{
  "name": "Full Name",
  "phone": "Phone Number",
  "email": "email@example.com",
  "location": "City, State",
  "linkedin": "https://linkedin.com/in/username",
  "linkedin_user": "username",
  "github": "https://github.com/username",
  "github_user": "username",
  "education": [
    { "school": "University Name", "location": "City, State", "degree": "Degree Name", "date": "Start -- End" }
  ],
  "experience": [
    { "title": "Job Title", "date": "Start -- End", "company": "Company Name", "location": "City", "items": ["Achievement 1 optimized for JD", "Achievement 2"] }
  ],
  "projects": [
    { "name": "Project Name", "tech": "Tech1, Tech2", "date": "Date", "items": ["Description optimized for JD"] }
  ],
  "skills": [
    { "category": "Languages", "items": "Java, Python, JavaScript" },
    { "category": "Frameworks", "items": "React, Node.js" },
    { "category": "Developer Tools", "items": "Git, Docker" },
    { "category": "Libraries", "items": "pandas, NumPy" }
  ]
}

Rules:
- Keep all factual info (names, dates, schools) exactly as in the resume.
- Rewrite bullet points to emphasize keywords from the JD.
- Add relevant skills from the JD if the candidate likely has them.
- If a field is missing from the resume, set it to an empty string or empty array.

Resume:
${resumeText.substring(0, 3000)}

Job Description:
${jdText.substring(0, 3000)}
  `;

  try {
    checkGenAI();
    const result = await genAI!.models.generateContent({
        model: activeModel,
        contents: prompt,
        config: { temperature: 0.3, responseMimeType: 'application/json' }
    });
    
    const text = result.text || '{}';
    const structuredData = JSON.parse(text);
    
    const latex = buildLatex(structuredData);

    // Build a markdown preview from the same data
    let md = `# ${structuredData.name || 'Resume'}\n`;
    if (structuredData.phone || structuredData.email || structuredData.location) {
      md += `**${[structuredData.phone, structuredData.email, structuredData.location].filter(Boolean).join(' | ')}**\n\n`;
    }
    md += `---\n\n## Education\n`;
    for (const edu of (structuredData.education || [])) {
      md += `**${edu.school}** — ${edu.degree} *(${edu.date})*\n\n`;
    }
    md += `---\n\n## Experience\n`;
    for (const exp of (structuredData.experience || [])) {
      md += `**${exp.title}** at ${exp.company} *(${exp.date})*\n`;
      for (const item of (exp.items || [])) {
        md += `- ${item}\n`;
      }
      md += '\n';
    }
    md += `---\n\n## Projects\n`;
    for (const proj of (structuredData.projects || [])) {
      md += `**${proj.name}** | *${proj.tech}* *(${proj.date})*\n`;
      for (const item of (proj.items || [])) {
        md += `- ${item}\n`;
      }
      md += '\n';
    }
    md += `---\n\n## Technical Skills\n`;
    for (const skill of (structuredData.skills || [])) {
      md += `**${skill.category}:** ${skill.items}\n\n`;
    }

    return {
      tailored_content_latex: latex,
      tailored_content_markdown: md
    };

  } catch (error: any) {
    console.error('Tailoring Error:', error?.message || error);
    return {
      tailored_content_latex: '% Error generating LaTeX',
      tailored_content_markdown: '# Error\n\nFailed to generate resume. Please try again.'
    };
  }
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const mapHistoryToGemini = (history: ChatMessage[]) => {
  const mapped: any[] = [];
  
  for (const msg of history) {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    const lastRole = mapped.length > 0 ? mapped[mapped.length - 1].role : null;
    
    if (mapped.length === 0 && role === 'model') {
      mapped.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }
    
    if (lastRole === role) {
      mapped[mapped.length - 1].parts[0].text += '\n' + msg.content;
    } else {
      mapped.push({ role, parts: [{ text: msg.content }] });
    }
  }

  if (mapped.length > 0 && mapped[mapped.length - 1].role === 'user') {
    mapped.push({ role: 'model', parts: [{ text: 'Acknowledged.' }] });
  }

  return mapped;
};

export const conductMockInterview = async (resumeText: string, jdText: string, history: ChatMessage[]): Promise<any> => {
  const systemPrompt = `You are an expert technical interviewer and hiring manager conducting a mock interview with a candidate.
You will base your questions primarily on the Job Description and the candidate's Resume.

Resume:
${resumeText.substring(0, 3000)}

Job Description:
${jdText.substring(0, 3000)}

Instructions:
1. If this is the start of the interview (no prior messages), ask a brief opening behavioral or technical question relevant to the JD and resume.
2. If the candidate has answered a question, briefly evaluate their answer (provide 1-2 sentences of constructive feedback) and then ask the NEXT relevant question.
3. Keep your responses concise, conversational, and professional. 
4. Ask ONLY ONE question at a time.
5. If the user indicates they are done or asks to finish, provide a brief summary of their performance.`;

  try {
    checkGenAI();

    if (history.length === 0) return { reply: "Let's begin!" };
    
    const previousHistory = history.slice(0, -1);
    const lastMessage = history[history.length - 1]!.content;

    const modifiedHistory: ChatMessage[] = [
      { role: 'user', content: systemPrompt },
      { role: 'assistant', content: 'Acknowledged. I will act as the interviewer.' },
      ...previousHistory
    ];

    const chatSession = genAI!.chats.create({
      model: activeModel,
      history: mapHistoryToGemini(modifiedHistory),
      config: {
        temperature: 0.5,
        maxOutputTokens: 500,
      }
    });

    const result = await chatSession.sendMessage({ message: lastMessage });
    const reply = result.text;
    return { reply };
  } catch (error: any) {
    console.error('Mock Interview Error:', error?.message || error);
    return { reply: "Error connecting to AI: " + (error?.message || "Unknown error") };
  }
};

export const checkAuthenticity = async (resumeText: string): Promise<any> => {
  const prompt = `
    You are an expert technical recruiter and resume auditor. Your job is to analyze the following resume and flag any inconsistencies, unrealistic claims, or potential "fake" skills.
    Examples of red flags:
    - Claiming 10 years of experience with a framework that was released 4 years ago.
    - Having multiple overlapping full-time jobs that seem highly improbable.
    - Completing a 4-year degree in 1 year.
    - Listing a massive number of deep technical skills that no single person typically masters.

    Structure: { "trust_score": 0-100, "red_flags": [{ "claim": "string", "reason": "string" }], "green_flags": ["string"], "authenticity_summary": "string" }
    Resume: ${resumeText.substring(0, 4000)}
  `;
  try {
    checkGenAI();
    const result = await genAI!.models.generateContent({
        model: activeModel,
        contents: prompt,
        config: { temperature: 0.1, responseMimeType: 'application/json' }
    });
    return JSON.parse(result.text || '{}');
  } catch (error: any) {
    console.error('Authenticity Check Error:', error?.message || error);
    throw new Error('Authenticity check failed: ' + (error?.message || 'Unknown error') + ` (Model: ${activeModel})`);
  }
};

export const chatWithMentor = async (history: ChatMessage[]): Promise<any> => {
  const systemPrompt = `You are an expert AI Career Mentor. You provide guidance on tech careers, learning roadmaps, resume building, and interview prep.
Keep your responses concise, encouraging, and highly actionable. Format your answers using markdown if necessary, but keep them brief.`;

  try {
    checkGenAI();

    if (history.length === 0) return { reply: "Hello!" };
    
    const previousHistory = history.slice(0, -1);
    const lastMessage = history[history.length - 1]!.content;

    const modifiedHistory: ChatMessage[] = [
      { role: 'user', content: systemPrompt },
      { role: 'assistant', content: 'Acknowledged. I am your AI Mentor.' },
      ...previousHistory
    ];

    const chatSession = genAI!.chats.create({
      model: activeModel,
      history: mapHistoryToGemini(modifiedHistory),
      config: {
        temperature: 0.7,
        maxOutputTokens: 600,
      }
    });

    const result = await chatSession.sendMessage({ message: lastMessage });
    const reply = result.text || 'I am having trouble responding right now. Let us try again.';
    return { reply };
  } catch (error: any) {
    console.error('Mentor Chat Error:', error?.message || error);
    return { reply: "Error connecting to AI: " + (error?.message || "Unknown error") };
  }
};

export const generateProfileSummary = async (resumeText: string): Promise<any> => {
  const prompt = `
    Analyze the following resume and create a personalized, dynamic profile summary for the user.
    Return a JSON object with this EXACT structure:
    {
      "bio": "A professional 3-4 sentence biography of the user based on their experience and skills.",
      "top_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "career_trajectory": "A short 1-2 sentence description of where their career seems to be heading (e.g. 'Progressing towards Senior Frontend Developer').",
      "experience_level": "e.g. Entry-level, Mid-level, Senior, Executive"
    }

    Resume:
    ${resumeText.substring(0, 4000)}
  `;
  try {
    checkGenAI();
    const result = await genAI!.models.generateContent({
        model: activeModel,
        contents: prompt,
        config: { temperature: 0.4, responseMimeType: 'application/json' }
    });
    
    const content = result.text || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error('Profile Summary Error:', error?.message || error);
    return {
      bio: "An aspiring professional ready for their next career move.",
      top_skills: [],
      career_trajectory: "Exploring new opportunities.",
      experience_level: "Unknown"
    };
  }
};
