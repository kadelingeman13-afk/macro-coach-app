import axios from 'axios';
import { Food } from '@/types/index';

const NUTRITIONIX_API_URL = 'https://www.nutritionix.com/api/v2';
const NUTRITIONIX_APP_ID = process.env.EXPO_PUBLIC_NUTRITIONIX_APP_ID || '';
const NUTRITIONIX_APP_KEY = process.env.EXPO_PUBLIC_NUTRITIONIX_APP_KEY || '';

export const nutritionixService = {
  async searchFoods(query: string, limit: number = 20): Promise<Food[]> {
    try {
      const response = await axios.get(`${NUTRITIONIX_API_URL}/search/instant`, {
        params: {
          query,
          limit,
          offset: 0,
        },
        headers: {
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_APP_KEY,
          'x-remote-user-id': '0',
        },
      });

      const foods: Food[] = [];

      // Combine common and branded foods
      if (response.data.common) {
        foods.push(
          ...response.data.common.slice(0, 10).map((item: any) => ({
            id: `common_${item.nix_id || item.food_name}`,
            name: item.food_name,
            calories: item.nf_calories || 0,
            protein: item.nf_protein || 0,
            carbs: item.nf_total_carbohydrate || 0,
            fat: item.nf_total_fat || 0,
            fiber: item.nf_dietary_fiber || 0,
            servingSize: item.serving_qty || 1,
            servingUnit: item.serving_unit || 'serving',
            source: 'nutritionix' as const,
          }))
        );
      }

      if (response.data.branded) {
        foods.push(
          ...response.data.branded.slice(0, 10).map((item: any) => ({
            id: `branded_${item.nix_id}`,
            name: `${item.brand_name} - ${item.food_name}`,
            calories: item.nf_calories || 0,
            protein: item.nf_protein || 0,
            carbs: item.nf_total_carbohydrate || 0,
            fat: item.nf_total_fat || 0,
            fiber: item.nf_dietary_fiber || 0,
            servingSize: item.serving_qty || 1,
            servingUnit: item.serving_unit || 'serving',
            brand: item.brand_name,
            barcode: item.nix_id,
            source: 'nutritionix' as const,
          }))
        );
      }

      return foods;
    } catch (error) {
      console.error('Nutritionix search error:', error);
      return [];
    }
  },

  async getFoodDetails(id: string): Promise<Food | null> {
    try {
      const response = await axios.get(`${NUTRITIONIX_API_URL}/search`, {
        params: { query: id },
        headers: {
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_APP_KEY,
        },
      });

      if (response.data.foods && response.data.foods.length > 0) {
        const item = response.data.foods[0];
        return {
          id: item.nix_id,
          name: item.food_name,
          calories: item.nf_calories || 0,
          protein: item.nf_protein || 0,
          carbs: item.nf_total_carbohydrate || 0,
          fat: item.nf_total_fat || 0,
          fiber: item.nf_dietary_fiber || 0,
          servingSize: item.serving_qty || 1,
          servingUnit: item.serving_unit || 'serving',
          source: 'nutritionix' as const,
        };
      }

      return null;
    } catch (error) {
      console.error('Get food details error:', error);
      return null;
    }
  },
};
