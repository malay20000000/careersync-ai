import { Router } from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { analyzeResume, compareResumeWithJD, tailorResume, conductMockInterview, checkAuthenticity } from '../services/ai.service.js';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as any;
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

router.post('/analyze', authMiddleware, upload.single('resume'), async (req: any, res: any): Promise<any> => {
  console.log('Analyze Career request received');
  try {
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const pdfData = await (pdf.default || pdf)(req.file.buffer);
    const resumeText = pdfData.text;

    const analysis = await analyzeResume(resumeText);
    res.json(analysis);

  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ message: 'Failed to analyze resume' });
  }
});

router.post('/authenticity', authMiddleware, upload.single('resume'), async (req: any, res: any): Promise<any> => {
  console.log('Authenticity check request received');
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const pdfData = await (pdf.default || pdf)(req.file.buffer);
    const resumeText = pdfData.text;

    const analysis = await checkAuthenticity(resumeText);
    res.json(analysis);

  } catch (error: any) {
    console.error('Error checking authenticity:', error);
    res.status(500).json({ message: 'Failed to check resume authenticity' });
  }
});

router.post('/analyze-jd', authMiddleware, upload.single('resume'), async (req: any, res: any): Promise<any> => {
  console.log('Analyze JD request received');
  console.log('Request body keys:', Object.keys(req.body));
  try {
    const { jdText } = req.body;
    console.log('JD Text length:', jdText?.length || 0);
    
    if (!req.file || !jdText) {
      console.log('Missing data:', { hasFile: !!req.file, hasJD: !!jdText });
      return res.status(400).json({ message: 'Missing resume file or Job Description text' });
    }


    const pdfData = await (pdf.default || pdf)(req.file.buffer);
    const resumeText = pdfData.text;

    const analysis = await compareResumeWithJD(resumeText, jdText);
    res.json(analysis);

  } catch (error: any) {
    console.error('Error analyzing resume against JD:', error);
    res.status(500).json({ message: 'Failed to analyze matching' });
  }
});

router.post('/tailor', authMiddleware, upload.single('resume'), async (req: any, res: any): Promise<any> => {
  try {
    const { jdText } = req.body;
    if (!req.file || !jdText) {
      return res.status(400).json({ message: 'Missing resume file or Job Description text' });
    }

    const pdfData = await (pdf.default || pdf)(req.file.buffer);
    const resumeText = pdfData.text;

    const result = await tailorResume(resumeText, jdText);
    res.json(result);

  } catch (error: any) {
    console.error('Error tailoring resume:', error);
    res.status(500).json({ message: 'Failed to tailor resume' });
  }
});
router.post('/compile-pdf', authMiddleware, async (req: any, res: any): Promise<any> => {
  console.log('Compile PDF request received');
  try {
    const { latex } = req.body;
    if (!latex) {
      console.log('No LaTeX code in request body');
      return res.status(400).json({ message: 'No LaTeX code provided' });
    }
    console.log('LaTeX code length:', latex.length);

    // Use latex.ytotech.com to compile LaTeX to PDF
    const payload = {
      compiler: "pdflatex",
      resources: [
        {
          main: true,
          content: latex
        }
      ]
    };

    const response = await fetch('https://latex.ytotech.com/builds/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('LaTeX API response status:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.error('LaTeX compilation failed:', response.status, errText);
      return res.status(500).json({ message: 'LaTeX compilation failed' });
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    console.log('PDF compiled successfully, size:', pdfBuffer.length, 'bytes');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Resume.pdf"');
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('PDF compilation error:', error?.message || error);
    res.status(500).json({ message: 'Failed to compile PDF' });
  }
});

// --- Mock Interview ---
router.post('/mock-interview', authMiddleware, upload.single('resume'), async (req: any, res: any): Promise<any> => {
  console.log('Mock interview request received');
  try {
    const { jdText, history } = req.body;
    let resumeText = '';

    // On the first call, a resume file is uploaded. On subsequent calls, resumeText comes from body.
    if (req.file) {
      const pdfData = await (pdf.default || pdf)(req.file.buffer);
      resumeText = pdfData.text;
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    if (!resumeText || !jdText) {
      return res.status(400).json({ message: 'Missing resume or Job Description text' });
    }

    const parsedHistory = typeof history === 'string' ? JSON.parse(history) : (history || []);
    const result = await conductMockInterview(resumeText, jdText, parsedHistory);
    res.json(result);

  } catch (error: any) {
    console.error('Mock interview error:', error);
    res.status(500).json({ message: 'Failed to process mock interview' });
  }
});

// --- Batch Analyze (Recruiter) ---
router.post('/batch-analyze', authMiddleware, upload.array('resumes', 20), async (req: any, res: any): Promise<any> => {
  console.log('Batch analyze request received');
  try {
    const { jdText } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0 || !jdText) {
      return res.status(400).json({ message: 'Missing resumes or Job Description' });
    }

    console.log(`Processing ${files.length} resumes`);

    const results = await Promise.all(
      files.map(async (file: Express.Multer.File, index: number) => {
        try {
          const pdfData = await (pdf.default || pdf)(file.buffer);
          const resumeText = pdfData.text;
          const analysis = await compareResumeWithJD(resumeText, jdText);
          
          // Extract candidate name from first line of resume
          const firstLine = resumeText.split('\n').find((l: string) => l.trim().length > 2) || `Candidate ${index + 1}`;
          
          return {
            filename: file.originalname,
            candidate_name: firstLine.trim().substring(0, 60),
            match_percentage: analysis.match_percentage || 0,
            matching_skills: analysis.matching_skills || [],
            missing_keywords: analysis.missing_keywords || [],
            suitability_summary: analysis.suitability_summary || '',
            status: 'success'
          };
        } catch (err: any) {
          return {
            filename: file.originalname,
            candidate_name: `Candidate ${index + 1}`,
            match_percentage: 0,
            matching_skills: [],
            missing_keywords: [],
            suitability_summary: 'Failed to analyze',
            status: 'error'
          };
        }
      })
    );

    // Sort by match percentage descending
    results.sort((a, b) => b.match_percentage - a.match_percentage);
    res.json({ candidates: results });

  } catch (error: any) {
    console.error('Batch analyze error:', error);
    res.status(500).json({ message: 'Failed to batch analyze' });
  }
});

export default router;
