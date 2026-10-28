import { NextResponse } from 'next/server';
import { getGeminiModel, hasGeminiKey } from '@/lib/gemini/client';

export interface ScoredTaskResult {
  id: string;
  task_name: string;
  score: number; // 1 to 10
  status: 'accepted' | 'rejected';
  reasoning: string;
  category: string;
  suggestedReplacement?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawTasks: string[] = body.tasks || [];

    if (!Array.isArray(rawTasks) || rawTasks.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of tasks (1 to 10 tasks).' },
        { status: 400 }
      );
    }

    const tasksToEvaluate = rawTasks.slice(0, 10).filter(t => typeof t === 'string' && t.trim().length > 0);

    let evaluatedTasks: ScoredTaskResult[] = [];

    if (hasGeminiKey()) {
      try {
        const model = getGeminiModel('gemini-1.5-flash');
        if (model) {
          const prompt = `
You are an executive productivity coach and cognitive performance evaluator.
Evaluate the following list of study/work tasks. Score each task on a strict scale of 1 to 10 based on its cognitive depth, clarity, actionability, and long-term educational/productivity value.
- Score 1-4: Shallow, passive, distracting, or vague busywork (e.g., "scroll feeds", "check random emails", "browse articles", "watch youtube clips"). Status must be "rejected".
- Score 5-10: Actionable, skill-building, structured problem solving, deep work, or deliberate practice. Status must be "accepted".

Tasks to evaluate:
${JSON.stringify(tasksToEvaluate)}

Return strictly valid JSON array of objects with the following structure:
[
  {
    "task_name": string,
    "score": number (1 to 10),
    "status": "accepted" | "rejected",
    "reasoning": string (concise explanation of why this score was assigned),
    "category": string (e.g., "Deep Work", "Deliberate Practice", "Passive Review", "Administrative"),
    "suggestedReplacement": string (only if status is "rejected", propose a high-value high-leverage alternative)
  }
]
`;
          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          const responseText = result.response.text();
          const parsed = JSON.parse(responseText);
          if (Array.isArray(parsed)) {
            evaluatedTasks = parsed.map((item, idx) => ({
              id: `task-${Date.now()}-${idx}`,
              task_name: item.task_name || tasksToEvaluate[idx],
              score: Math.max(1, Math.min(10, Math.round(item.score || 5))),
              status: (item.score >= 5 ? 'accepted' : 'rejected') as 'accepted' | 'rejected',
              reasoning: item.reasoning || 'Evaluated based on cognitive value.',
              category: item.category || 'Focus Objective',
              suggestedReplacement: item.suggestedReplacement,
            }));
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to heuristic engine:', geminiErr);
      }
    }

    // Heuristic fallback if Gemini key is absent or call failed
    if (evaluatedTasks.length === 0) {
      evaluatedTasks = evaluateTasksHeuristic(tasksToEvaluate);
    }

    const acceptedCount = evaluatedTasks.filter(t => t.status === 'accepted').length;
    const rejectedCount = evaluatedTasks.filter(t => t.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      evaluatedTasks,
      acceptedCount,
      rejectedCount,
      needsReplacements: rejectedCount > 0,
      engine: hasGeminiKey() ? 'gemini-1.5-flash' : 'heuristic-ai-fallback',
    });
  } catch (error: any) {
    console.error('Error in /api/ai/score-tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error evaluating tasks' },
      { status: 500 }
    );
  }
}

// Rule-based cognitive depth heuristic fallback
function evaluateTasksHeuristic(tasks: string[]): ScoredTaskResult[] {
  const shallowKeywords = ['scroll', 'browse', 'check phone', 'watch shorts', 'reels', 'chill', 'randomly', 'play games', 'idle', 'mess around'];
  const deepKeywords = ['implement', 'build', 'solve', 'read chapter', 'write', 'debug', 'proof', 'memorize', 'analyze', 'design', 'refactor', 'calculate', 'study'];

  return tasks.map((taskName, idx) => {
    const lower = taskName.toLowerCase();
    let score = 7;
    let reasoning = 'Well-defined learning or productive output.';
    let category = 'Deep Work';
    let suggestedReplacement: string | undefined = undefined;

    const hasShallow = shallowKeywords.some(w => lower.includes(w));
    const hasDeep = deepKeywords.some(w => lower.includes(w));

    if (hasShallow) {
      score = Math.floor(Math.random() * 2) + 2; // 2 or 3
      reasoning = 'Low cognitive density and high distraction vulnerability.';
      category = 'Distraction Risk';
      suggestedReplacement = `Transform "${taskName}" into a structured 30-min active synthesis or case-study exercise.`;
    } else if (taskName.trim().length < 8) {
      score = 4;
      reasoning = 'Too ambiguous or lacks measurable milestone criteria.';
      category = 'Unstructured';
      suggestedReplacement = `Add specific parameters (e.g., "${taskName}: complete 3 targeted exercises and verify answers")`;
    } else if (hasDeep) {
      score = Math.floor(Math.random() * 2) + 8; // 8, 9
      reasoning = 'High cognitive leverage with active creation and problem solving.';
      category = 'Deliberate Practice';
    } else {
      score = 6;
      reasoning = 'Acceptable focus target with moderate cognitive engagement.';
      category = 'Core Operations';
    }

    const status = score >= 5 ? 'accepted' : 'rejected';

    return {
      id: `task-${Date.now()}-${idx}`,
      task_name: taskName,
      score,
      status,
      reasoning,
      category,
      suggestedReplacement,
    };
  });
}
