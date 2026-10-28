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

      const subtopic = q.subtopic || 'General';
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

    if (hasGeminiKey()) {
      try {
        const model = getGeminiModel('gemini-1.5-flash');
        if (model) {
          const prompt = `
You are a senior cognitive performance analyst and adaptive learning tutor.
A student just completed a 20-question diagnostic quiz on "${taskName}".
Diagnostic Data:
- Score: ${correctCount}/${questions.length} (${percentage}%)
- Identified Strong Areas: ${JSON.stringify(calculatedStrong)}
- Identified Weak Areas: ${JSON.stringify(calculatedWeak)}

Provide a diagnostic learning evaluation with actionable study recommendations.
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
              nextMilestone: parsed.nextMilestone || 'Complete next 50-minute deliberate practice sprint.',
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
        weakAreas: calculatedWeak.length > 0 ? calculatedWeak : ['Deep Architectural Edge Cases'],
        strongAreas: calculatedStrong.length > 0 ? calculatedStrong : ['Fundamental Theory & Core Invariants'],
        executiveSummary: percentage >= 80
          ? `Outstanding cognitive retention! You demonstrated high proficiency across ${cleanSummary(taskName)} with exceptional mastery of core architectural invariants.`
          : percentage >= 60
          ? `Solid foundation established in ${cleanSummary(taskName)}. Targeted review of boundary failure cases will accelerate you toward mastery.`
          : `Fundamental gaps detected in ${cleanSummary(taskName)}. Prioritize the recommended conceptual deep-dives before advancing to higher complexity tasks.`,
        contentRecommendations: [
          {
            title: `${taskName}: Official Technical Documentation & Deep-Dive Reference`,
            type: 'documentation',
            url: `https://developer.mozilla.org/`,
            description: `Authoritative specifications and standard idioms covering edge-case behaviors.`,
          },
          {
            title: `Systems Architecture & Cognitive Retentive Patterns for ${taskName}`,
            type: 'article',
            url: `https://arxiv.org/`,
            description: `In-depth structural breakdown of error mitigations and optimal invariant management.`,
          },
          {
            title: `Masterclass Walkthrough: Practical Implementation of ${taskName}`,
            type: 'video',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(taskName + ' masterclass tutorial')}`,
            description: `End-to-end breakdown by industry specialists detailing failure recovery protocols.`,
          },
          {
            title: `Deliberate Practice Sandbox & Self-Test Lab`,
            type: 'practice',
            url: `#`,
            description: `Hands-on isolated scenario simulations to reinforce weak boundary conditions.`,
          },
        ],
        nextMilestone: percentage >= 80 ? 'Advance to Next Level Task or Lead a Study Room' : 'Review targeted weak subtopics in a 25-minute Pomodoro session',
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

function cleanSummary(name: string) {
  return name.replace(/[^\w\s-]/gi, '').trim();
}
