import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useAppStore } from '@/store/appStore';
import { splitMealMacros } from '@/utils/calculations';
import { Meal, MealConfig, UserProfile, MacroTargets } from '@/types/index';

const MEAL_OPTIONS = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
  { id: 'morning_snack', name: 'Morning Snack', icon: '☕' },
  { id: 'lunch', name: 'Lunch', icon: '🍽️' },
  { id: 'afternoon_snack', name: 'Afternoon Snack', icon: '🥗' },
  { id: 'dinner', name: 'Dinner', icon: '🍴' },
  { id: 'evening_snack', name: 'Evening Snack', icon: '🍪' },
];

const SPLIT_STYLES = [
  { id: 'even', name: 'Even Split', description: 'Equal macros across meals' },
  { id: 'big_breakfast', name: 'Big Breakfast', description: 'Larger breakfast, smaller lunch' },
  { id: 'big_lunch_dinner', name: 'Big Lunch & Dinner', description: 'Larger lunch and dinner' },
];

export const MealSetupScreen = ({ route, navigation }: any) => {
  const { profile, macros } = route.params;
  const { setMealConfig } = useAppStore();
  
  const [splitStyle, setSplitStyle] = useState<'even' | 'big_breakfast' | 'big_lunch_dinner'>('even');
  const [activeMeals, setActiveMeals] = useState<Set<string>>(
    new Set(['breakfast', 'lunch', 'afternoon_snack', 'dinner'])
  );
  const [mealMacros, setMealMacros] = useState<Record<string, any>>({});

  useEffect(() => {
    updateMealMacros();
  }, [splitStyle, activeMeals]);

  const updateMealMacros = () => {
    const splitMacros = splitMealMacros(
      macros.calories,
      macros.protein,
      macros.carbs,
      macros.fat,
      activeMeals.size,
      splitStyle
    );

    const newMealMacros: Record<string, any> = {};
    MEAL_OPTIONS.forEach((meal) => {
      if (activeMeals.has(meal.id)) {
        newMealMacros[meal.id] = splitMacros[meal.id];
      }
    });

    setMealMacros(newMealMacros);
  };

  const toggleMeal = (mealId: string) => {
    const updated = new Set(activeMeals);
    if (updated.has(mealId)) {
      updated.delete(mealId);
    } else {
      updated.add(mealId);
    }
    setActiveMeals(updated);
  };

  const handleComplete = () => {
    if (activeMeals.size === 0) {
      Alert.alert('Error', 'Please select at least one meal');
      return;
    }

    const meals: Meal[] = MEAL_OPTIONS
      .filter((m) => activeMeals.has(m.id))
      .map((m) => ({
        id: m.id,
        name: m.id as any,
        isActive: true,
        targetCalories: mealMacros[m.id]?.calories || 0,
        targetProtein: mealMacros[m.id]?.protein || 0,
        targetCarbs: mealMacros[m.id]?.carbs || 0,
        targetFat: mealMacros[m.id]?.fat || 0,
        isLocked: false,
      }));

    const config: MealConfig = {
      uid: profile.uid,
      meals,
      splitStyle,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setMealConfig(config);
    navigation.replace('MainApp');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Meal Structure</Text>
        <Text style={styles.subtitle}>Choose your meals and how to split macros</Text>

        {/* Split Style Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How would you like to split your macros?</Text>
          {SPLIT_STYLES.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[styles.styleOption, splitStyle === style.id && styles.styleOptionActive]}
              onPress={() => setSplitStyle(style.id as any)}
            >
              <View style={styles.styleOptionContent}>
                <Text style={styles.styleOptionTitle}>{style.name}</Text>
                <Text style={styles.styleOptionDesc}>{style.description}</Text>
              </View>
              <View style={[styles.radio, splitStyle === style.id && styles.radioActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Meal Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select your meals</Text>
          {MEAL_OPTIONS.map((meal) => (
            <View key={meal.id} style={styles.mealOption}>
              <TouchableOpacity
                style={styles.mealToggle}
                onPress={() => toggleMeal(meal.id)}
              >
                <View style={styles.mealHeader}>
                  <Text style={styles.mealIcon}>{meal.icon}</Text>
                  <Text style={styles.mealName}>{meal.name}</Text>
                </View>
                <View style={[styles.checkbox, activeMeals.has(meal.id) && styles.checkboxActive]}>
                  {activeMeals.has(meal.id) && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>

              {activeMeals.has(meal.id) && mealMacros[meal.id] && (
                <View style={styles.mealMacros}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Cal</Text>
                    <Text style={styles.macroValue}>{mealMacros[meal.id].calories}</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Pro</Text>
                    <Text style={styles.macroValue}>{mealMacros[meal.id].protein}g</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Carb</Text>
                    <Text style={styles.macroValue}>{mealMacros[meal.id].carbs}g</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>Fat</Text>
                    <Text style={styles.macroValue}>{mealMacros[meal.id].fat}g</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Daily Totals */}
        <View style={styles.totalBox}>
          <Text style={styles.totalTitle}>Daily Totals</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Calories</Text>
            <Text style={styles.totalValue}>{macros.calories}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Protein</Text>
            <Text style={styles.totalValue}>{macros.protein}g</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Carbs</Text>
            <Text style={styles.totalValue}>{macros.carbs}g</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Fat</Text>
            <Text style={styles.totalValue}>{macros.fat}g</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>Start Tracking →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  styleOption: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  styleOptionActive: {
    borderColor: '#6BCB77',
    backgroundColor: '#f0f9f6',
  },
  styleOptionContent: {
    flex: 1,
  },
  styleOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  styleOptionDesc: {
    fontSize: 12,
    color: '#999',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginLeft: 16,
  },
  radioActive: {
    borderColor: '#6BCB77',
    backgroundColor: '#6BCB77',
  },
  mealOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  mealToggle: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#6BCB77',
    borderColor: '#6BCB77',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mealMacros: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6BCB77',
  },
  totalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  totalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6BCB77',
  },
  button: {
    backgroundColor: '#6BCB77',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
