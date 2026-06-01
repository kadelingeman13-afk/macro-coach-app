import axios from 'axios';
import { FixMyDayResponse } from '@/types/index';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';

export const claudeService = {
  async generateFixMyDayResponse(
    foodsEaten: string[],
    currentMacros: { calories: number; protein: number; carbs: number; fat: number },
    targetMacros: { calories: number; protein: number; carbs: number; fat: number }
  ): Promise<FixMyDayResponse> {
    try {
      const prompt = `You are a nutrition coach helping someone balance their macros for the day.

Foods eaten today:
${foodsEaten.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Current macros:
- Calories: ${currentMacros.calories} / ${targetMacros.calories}
- Protein: ${currentMacros.protein}g / ${targetMacros.protein}g
- Carbs: ${currentMacros.carbs}g / ${targetMacros.carbs}g
- Fat: ${currentMacros.fat}g / ${targetMacros.fat}g

Please provide:
1. A brief analysis of their day (2-3 sentences)
2. 3 meal suggestions to balance their macros for the rest of the day
3. 2-3 food swaps they could make if needed
4. Any adjustments or tips to hit their targets

Format your response as JSON with this structure:
{
  "analysis": "brief analysis here",
  "suggestions": [
    {
      "name": "meal name",
      "description": "short description",
      "calories": 400,
      "protein": 35,
      "carbs": 45,
      "fat": 8
    }
  ],
  "swaps": [
    {
      "from": "current food",
      "to": "better alternative",
      "reason": "why this is better",
      "macrosDifference": {
        "calories": 50,
        "protein": 5,
        "carbs": 0,
        "fat": -2
      }
    }
  ],
  "adjustments": ["tip 1", "tip 2"]
}`;

      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      );

      const content = response.data.content[0].text;
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            analysis: parsed.analysis || 'Keep up the good work!',
            suggestions: parsed.suggestions || [],
            swaps: parsed.swaps || [],
            adjustments: parsed.adjustments || [],
          };
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }

      return {
        analysis: 'Great job logging your food! Keep these foods in mind for tomorrow.',
        suggestions: [],
        swaps: [],
        adjustments: ['Stay consistent with your logging', 'Drink plenty of water'],
      };
    } catch (error) {
      console.error('Claude API error:', error);
      return {
        analysis: 'Keep logging your food consistently - you are doing great!',
        suggestions: [],
        swaps: [],
        adjustments: ['Continue tracking', 'Aim to hit your targets'],
      };
    }
  },

  async generateDailyCheckIn(
    daysSinceStart: number,
    consistencyScore: number,
    macroHitRate: number
  ): Promise<string> {
    try {
      const prompt = `You are an encouraging nutrition coach. Generate a short, personalized daily check-in message (2-3 sentences max) for someone who:
- Has been using the app for ${daysSinceStart} days
- Has a ${consistencyScore}% consistency score this week
- Hits their macros ${macroHitRate}% of the time

Be encouraging but honest. Keep it motivational and actionable.`;

      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 256,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Daily checkin error:', error);
      return 'Keep up the great work with your nutrition tracking!';
    }
  },

  async generateMealSuggestions(
    remainingMacros: { calories: number; protein: number; carbs: number; fat: number },
    preferences?: string[]
  ): Promise<string[]> {
    try {
      const prompt = `Suggest 3 specific meals that would fit these remaining macros for today:
- Calories: ${remainingMacros.calories}
- Protein: ${remainingMacros.protein}g
- Carbs: ${remainingMacros.carbs}g
- Fat: ${remainingMacros.fat}g

${preferences ? `User preferences: ${preferences.join(', ')}` : ''}

Return only the meal names, one per line, no additional text.`;

      const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 200,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      );

      return response.data.content[0].text.split('\n').filter((s: string) => s.trim());
    } catch (error) {
      console.error('Meal suggestions error:', error);
      return ['Grilled chicken with rice', 'Greek yogurt with fruit', 'Turkey sandwich'];
    }
  },
};
