import { NextResponse } from 'next/server';
import { getGeminiModel, hasGeminiKey } from '@/lib/gemini/client';
import { QuizQuestion } from '../generate-quiz/route';

export interface QuizAnalysisResult {
  score: number; // percentage
  totalQuestions: number;
  correctAnswers: number;
  weakAreas: string[];
  strongAreas: string[];
  contentRecommendations: {
    title: string;
    type: 'article' | 'video' | 'practice' | 'documentation';
    url: string;
    description: string;
  }[];
  executiveSummary: string;
  nextMilestone: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const taskName: string = body.taskName || 'Subject';
    const questions: QuizQuestion[] = body.questions || [];
    const userAnswers: Record<number, number> = body.userAnswers || {}; // questionId -> chosenIndex
    const userApiKey: string | undefined = req.headers.get('x-gemini-api-key') || body.userApiKey;

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Questions payload missing' }, { status: 400 });
    }

    // Evaluate answers
    let correctCount = 0;
    const topicPerformance: Record<string, { correct: number; total: number }> = {};

    questions.forEach(q => {
      const chosen = userAnswers[q.id];
      const isCorrect = chosen === q.correctIndex;
      if (isCorrect) correctCount++;

      const subtopic = q.subtopic || 'Core Concept';
      if (!topicPerformance[subtopic]) {
        topicPerformance[subtopic] = { correct: 0, total: 0 };
      }
      topicPerformance[subtopic].total++;
      if (isCorrect) topicPerformance[subtopic].correct++;
    });

    const percentage = Math.round((correctCount / questions.length) * 100);

    const calculatedWeak: string[] = [];
    const calculatedStrong: string[] = [];

    Object.entries(topicPerformance).forEach(([subtopic, stats]) => {
      const ratio = stats.correct / stats.total;
      if (ratio >= 0.7) {
        calculatedStrong.push(`${subtopic} (${Math.round(ratio * 100)}% accuracy)`);
      } else {
        calculatedWeak.push(`${subtopic} (${Math.round(ratio * 100)}% accuracy)`);
      }
    });

    let analysis: QuizAnalysisResult | null = null;

    if (hasGeminiKey(userApiKey)) {
      try {
        const model = getGeminiModel(userApiKey, 'gemini-1.5-flash');
        if (model) {
          const prompt = `
You are a senior academic diagnostic analyst and specialized learning advisor.
A student just completed a 20-question diagnostic quiz specifically on "${taskName}".
Diagnostic Data:
- Score: ${correctCount}/${questions.length} (${percentage}%)
- Identified Strong Areas: ${JSON.stringify(calculatedStrong)}
- Identified Weak Areas: ${JSON.stringify(calculatedWeak)}

Provide a diagnostic learning evaluation with targeted study recommendations strictly relevant to "${taskName}".
Strictly return a JSON object with this exact schema:
{
  "executiveSummary": string,
  "weakAreas": string[],
  "strongAreas": string[],
  "contentRecommendations": [
    {
      "title": string,
      "type": "article" | "video" | "practice" | "documentation",
      "url": string,
      "description": string
    }
  ],
  "nextMilestone": string
}
`;
          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          const parsed = JSON.parse(result.response.text());
          if (parsed && parsed.executiveSummary) {
            analysis = {
              score: percentage,
              totalQuestions: questions.length,
              correctAnswers: correctCount,
              weakAreas: parsed.weakAreas?.length ? parsed.weakAreas : calculatedWeak,
              strongAreas: parsed.strongAreas?.length ? parsed.strongAreas : calculatedStrong,
              contentRecommendations: parsed.contentRecommendations || [],
              executiveSummary: parsed.executiveSummary,
              nextMilestone: parsed.nextMilestone || 'Complete next 25-minute deliberate practice sprint.',
            };
          }
        }
      } catch (err) {
        console.warn('Gemini quiz analysis error, fallback engaged:', err);
      }
    }

    if (!analysis) {
      analysis = {
        score: percentage,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        weakAreas: calculatedWeak.length > 0 ? calculatedWeak : [`Advanced Invariant Analysis in ${taskName}`],
        strongAreas: calculatedStrong.length > 0 ? calculatedStrong : [`Core Foundational Principles of ${taskName}`],
        executiveSummary: percentage >= 80
          ? `Outstanding retention! You demonstrated high proficiency across "${taskName}" with strong conceptual mastery.`
          : percentage >= 60
          ? `Solid foundation established in "${taskName}". Targeted review of weaker subtopics will elevate you to mastery.`
          : `Gaps identified in foundational understanding of "${taskName}". Prioritize the curated study guides below before moving to higher difficulty levels.`,
        contentRecommendations: [
          {
            title: `${taskName}: Comprehensive Study Guide & Reference Materials`,
            type: 'documentation',
            url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(taskName)}`,
            description: `Authoritative conceptual overview and historical/theoretical context for ${taskName}.`,
          },
          {
            title: `Advanced Academic Papers & Deep Dives: ${taskName}`,
            type: 'article',
            url: `https://scholar.google.com/scholar?q=${encodeURIComponent(taskName)}`,
            description: `Peer-reviewed analysis exploring experimental proofs, methodologies, and edge cases in ${taskName}.`,
          },
          {
            title: `Visual Masterclass Walkthrough: ${taskName}`,
            type: 'video',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(taskName + ' masterclass tutorial lecture')}`,
            description: `Structured lecture walkthrough breaking down foundational principles and practical problem solving.`,
          },
          {
            title: `Deliberate Practice & Flashcard Self-Assessment`,
            type: 'practice',
            url: `https://quizlet.com/search?query=${encodeURIComponent(taskName)}`,
            description: `Spaced-repetition reinforcement to turn weak conceptual subtopics into verified recall.`,
          },
        ],
        nextMilestone: percentage >= 80
          ? 'Advance to Next Level Topic or Lead a Study Room'
          : `Review targeted weak subtopics in a 25-minute Pomodoro session on ${taskName}`,
      };
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Error analyzing quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze quiz' },
      { status: 500 }
    );
  }
}
