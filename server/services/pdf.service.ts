import * as pdfLib from 'pdf-parse';
const pdf = (pdfLib as any).default || pdfLib;

export class PDFService {
  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await (pdf as any)(buffer);
      return this.cleanText(data.text);
    } catch (error) {
      console.error('PDF extraction error:', error);
      return '';
    }
  }

  async extractTextFromDOCX(buffer: Buffer): Promise<string> {
    try {
      // For now, fallback to basic text extraction
      // TODO: Improve with 'mammoth' library for better DOCX parsing
      const text = buffer.toString('utf-8');
      return this.cleanText(text);
    } catch (error) {
      console.error('DOCX extraction error:', error);
      return '';
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  calculateATSScore(resumeText: string): number {
    let score = 0;

    const checks = [
      { regex: /email|e-mail/i, points: 10 },
      { regex: /phone|mobile|cell/i, points: 10 },
      { regex: /experience|work history/i, points: 15 },
      { regex: /education|degree|university|college/i, points: 15 },
      { regex: /skills|technical skills|competencies/i, points: 15 },
      { regex: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i, points: 10 },
      { regex: /\b(managed|led|developed|created|implemented|designed|improved|increased|decreased|achieved)\b/gi, points: 15 },
      { regex: /\d+%|\d+\s*(percent|users|customers|revenue|sales)/gi, points: 10 }
    ];

    checks.forEach(check => {
      if (check.regex.test(resumeText)) {
        score += check.points;
      }
    });

    return Math.min(score, 100);
  }
}

export const pdfService = new PDFService();
