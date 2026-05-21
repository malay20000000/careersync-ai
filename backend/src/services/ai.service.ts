import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1', 
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173", 
    "X-Title": "CareerSync AI",
  }
}) : null;

export const analyzeResume = async (resumeText: string): Promise<any> => {
  const prompt = `
    Analyze the following resume text and provide a detailed JSON response.
    Structure: { "score": 0-100, "ats_compatibility": 0-100, "strengths": [], "weaknesses": [], "skill_gaps": [], "suggestions": [], "roadmap": { "0-3 months": [], "3-6 months": [], "6-12 months": [] } }
    Resume Text: ${resumeText.substring(0, 4000)}
  `;
  try {
    if (!openai) throw new Error('OpenAI client not initialized');
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-pro-exp-02-05:free",
      messages: [{ role: "system", content: "You output only structured JSON." }, { role: "user", content: prompt }],
      temperature: 0.2
    });
    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error('AI Analysis Error:', error?.message || error);
    throw new Error('AI Analysis failed');
  }
};

export const compareResumeWithJD = async (resumeText: string, jdText: string): Promise<any> => {
  const prompt = `
    Compare the following Resume against the Job Description (JD).
    Structure: { "match_percentage": 0-100, "missing_keywords": [], "matching_skills": [], "recommendations": [], "suitability_summary": "" }
    Resume: ${resumeText.substring(0, 3000)}
    JD: ${jdText.substring(0, 3000)}
  `;
  try {
    if (!openai) throw new Error('OpenAI client not initialized');
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-pro-exp-02-05:free",
      messages: [{ role: "system", content: "You output only structured JSON." }, { role: "user", content: prompt }],
      temperature: 0.2
    });
    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error('JD Analysis Error:', error?.message || error);
    throw new Error('JD Analysis failed');
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
    if (!openai) throw new Error('OpenAI client not initialized');
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-pro-exp-02-05:free",
      messages: [
        { role: "system", content: "You output only valid JSON. No markdown fences, no explanation." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });
    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const structuredData = JSON.parse(jsonMatch[0]);
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
    if (!openai) throw new Error('OpenAI client not initialized');
    
    // Prepare messages array for the LLM
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...history
    ];

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-pro-exp-02-05:free",
      messages: messages,
      temperature: 0.5,
      max_tokens: 500
    });

    const reply = response.choices[0]?.message?.content || 'I am having trouble responding right now. Let us try again.';
    return { reply };
  } catch (error: any) {
    console.error('Mock Interview Error:', error?.message || error);
    return { reply: "There was an error connecting to the interviewer AI. Please try again." };
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

    Structure: { "trust_score": 0-100, "red_flags": [{ "claim": "", "reason": "" }], "green_flags": [], "authenticity_summary": "" }
    Resume: ${resumeText.substring(0, 4000)}
  `;
  try {
    if (!openai) throw new Error('OpenAI client not initialized');
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-pro-exp-02-05:free",
      messages: [{ role: "system", content: "You output only structured JSON." }, { role: "user", content: prompt }],
      temperature: 0.1
    });
    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error('Authenticity Check Error:', error?.message || error);
    throw new Error('Authenticity check failed');
  }
};

export const chatWithMentor = async (history: ChatMessage[]): Promise<any> => {
  const systemPrompt = `You are an expert AI Career Mentor. You provide guidance on tech careers, learning roadmaps, resume building, and interview prep.
Keep your responses concise, encouraging, and highly actionable. Format your answers using markdown if necessary, but keep them brief.`;

  try {
    if (!openai) throw new Error('OpenAI client not initialized');
    
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...history
    ];

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-pro-exp-02-05:free",
      messages: messages,
      temperature: 0.7,
      max_tokens: 600
    });

    const reply = response.choices[0]?.message?.content || 'I am having trouble responding right now. Let us try again.';
    return { reply };
  } catch (error: any) {
    console.error('Mentor Chat Error:', error?.message || error);
    return { reply: "There was an error connecting to your AI Mentor. Please try again." };
  }
};

