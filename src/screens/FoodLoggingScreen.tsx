import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAppStore } from '@/store/appStore';
import { nutritionixService } from '@/services/nutritionix';
import { Food, FoodLog } from '@/types/index';
import { getTodayString } from '@/utils/formatting';

export const FoodLoggingScreen = ({ route, navigation }: any) => {
  const { mealId } = route.params || { mealId: 'lunch' };
  const { mealConfig, setDailyLogs, dailyLogs } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('1');

  const currentMeal = mealConfig?.meals.find((m) => m.id === mealId);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchFoods();
    } else {
      setFoods([]);
    }
  }, [searchQuery]);

  const searchFoods = async () => {
    setIsLoading(true);
    try {
      const results = await nutritionixService.searchFoods(searchQuery, 15);
      setFoods(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search foods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = () => {
    if (!selectedFood || !quantity) {
      Alert.alert('Error', 'Please select food and enter quantity');
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const today = getTodayString();
    const foodLog: FoodLog = {
      id: `${Date.now()}`,
      uid: 'user',
      mealId,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      quantity: qty,
      servingSize: selectedFood.servingSize.toString(),
      servingUnit: selectedFood.servingUnit,
      calories: Math.round(selectedFood.calories * qty),
      protein: Math.round(selectedFood.protein * qty * 10) / 10,
      carbs: Math.round(selectedFood.carbs * qty * 10) / 10,
      fat: Math.round(selectedFood.fat * qty * 10) / 10,
      fiber: selectedFood.fiber ? Math.round(selectedFood.fiber * qty * 10) / 10 : undefined,
      loggedAt: new Date(),
      date: today,
    };

    const updatedLogs = [...dailyLogs];
    const todayLogIndex = updatedLogs.findIndex((log) => log.date === today);

    if (todayLogIndex >= 0) {
      updatedLogs[todayLogIndex].foods.push(foodLog);
    } else {
      updatedLogs.push({
        uid: 'user',
        date: today,
        foods: [foodLog],
        water: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    setDailyLogs(updatedLogs);
    Alert.alert('Success', `${selectedFood.name} added to ${currentMeal?.name}`);
    setSelectedFood(null);
    setQuantity('1');
    setSearchQuery('');
    setFoods([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Food to {currentMeal?.name}</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {isLoading && <ActivityIndicator color="#6BCB77" style={styles.loader} />}
        </View>

        {selectedFood && (
          <View style={styles.selectedFoodCard}>
            <Text style={styles.selectedFoodTitle}>{selectedFood.name}</Text>
            <View style={styles.selectedFoodMacros}>
              <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Per Serving:</Text>
              </View>
              <View style={styles.macroRow}>
                <Text>Calories: {selectedFood.calories}</Text>
                <Text>Protein: {selectedFood.protein}g</Text>
              </View>
              <View style={styles.macroRow}>
                <Text>Carbs: {selectedFood.carbs}g</Text>
                <Text>Fat: {selectedFood.fat}g</Text>
              </View>
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>
                Quantity ({selectedFood.servingUnit})
              </Text>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                placeholder="1"
              />
            </View>

            <View style={styles.totalMacros}>
              <Text style={styles.totalTitle}>Total for {quantity} serving(s):</Text>
              <View style={styles.macroRow}>
                <Text style={styles.totalMacroLabel}>Calories:</Text>
                <Text style={styles.totalMacroValue}>{Math.round(selectedFood.calories * parseFloat(quantity || '1'))}</Text>
              </View>
              <View style={styles.macroRow}>
                <Text style={styles.totalMacroLabel}>Protein:</Text>
                <Text style={styles.totalMacroValue}>{(selectedFood.protein * parseFloat(quantity || '1')).toFixed(1)}g</Text>
              </View>
              <View style={styles.macroRow}>
                <Text style={styles.totalMacroLabel}>Carbs:</Text>
                <Text style={styles.totalMacroValue}>{(selectedFood.carbs * parseFloat(quantity || '1')).toFixed(1)}g</Text>
              </View>
              <View style={styles.macroRow}>
                <Text style={styles.totalMacroLabel}>Fat:</Text>
                <Text style={styles.totalMacroValue}>{(selectedFood.fat * parseFloat(quantity || '1')).toFixed(1)}g</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => {
                  setSelectedFood(null);
                  setQuantity('1');
                }}
              >
                <Text style={styles.buttonText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleAddFood}>
                <Text style={[styles.buttonText, { color: '#fff' }]}>Add to Meal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!selectedFood && foods.length > 0 && (
          <View style={styles.foodList}>
            {foods.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.foodItem}
                onPress={() => setSelectedFood(food)}
              >
                <View style={styles.foodItemContent}>
                  <Text style={styles.foodItemName}>{food.name}</Text>
                  <Text style={styles.foodItemMacros}>
                    {food.calories} cal • {food.protein}g P • {food.carbs}g C • {food.fat}g F
                  </Text>
                  <Text style={styles.foodItemServing}>
                    Per {food.servingSize} {food.servingUnit}
                  </Text>
                </View>
                <Text style={styles.selectButton}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchQuery.length > 2 && !isLoading && foods.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No foods found</Text>
            <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 16,
    color: '#6BCB77',
    fontWeight: '600',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBox: {
    position: 'relative',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  loader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  selectedFoodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  selectedFoodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  selectedFoodMacros: {
    marginBottom: 16,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  macroLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  quantitySection: {
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  quantityInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  totalMacros: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  totalTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  totalMacroLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  totalMacroValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6BCB77',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#6BCB77',
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  foodList: {
    gap: 10,
  },
  foodItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodItemContent: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  foodItemMacros: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  foodItemServing: {
    fontSize: 11,
    color: '#999',
  },
  selectButton: {
    fontSize: 18,
    color: '#6BCB77',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
});
