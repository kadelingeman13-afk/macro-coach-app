import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { useAppStore } from '@/store/appStore';
import { useIsFocused } from '@react-navigation/native';
import { formatDate, getTodayString, formatPercentage } from '@/utils/formatting';
import { calculateRemaining } from '@/utils/calculations';

export const DashboardScreen = ({ navigation }: any) => {
  const {
    user,
    macroTargets,
    mealConfig,
    dailyLogs,
    weights,
    waterLog,
  } = useAppStore();

  const isFocused = useIsFocused();
  const [todayMacros, setTodayMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [todayWater, setTodayWater] = useState(0);
  const [remaining, setRemaining] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    if (isFocused) {
      updateTodayStats();
    }
  }, [isFocused, dailyLogs, waterLog]);

  const updateTodayStats = () => {
    const today = getTodayString();
    const todayLog = dailyLogs.find((log) => log.date === today);

    if (todayLog) {
      const totals = {
        calories: todayLog.foods.reduce((sum, f) => sum + f.calories, 0),
        protein: todayLog.foods.reduce((sum, f) => sum + f.protein, 0),
        carbs: todayLog.foods.reduce((sum, f) => sum + f.carbs, 0),
        fat: todayLog.foods.reduce((sum, f) => sum + f.fat, 0),
      };
      setTodayMacros(totals);
      setTodayWater(todayLog.water || 0);

      if (macroTargets) {
        setRemaining(calculateRemaining(macroTargets, totals));
      }
    } else {
      setTodayMacros({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      setTodayWater(0);
      if (macroTargets) {
        setRemaining(macroTargets);
      }
    }
  };

  const getMacroPercentage = (current: number, target: number): number => {
    return target > 0 ? Math.round((current / target) * 100) : 0;
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage < 80) return '#FF6B6B';
    if (percentage < 100) return '#FFD93D';
    if (percentage <= 110) return '#6BCB77';
    return '#FF6B6B';
  };

  if (!user || !macroTargets || !mealConfig) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const caloriePercent = getMacroPercentage(todayMacros.calories, macroTargets.calories);
  const proteinPercent = getMacroPercentage(todayMacros.protein, macroTargets.protein);
  const carbsPercent = getMacroPercentage(todayMacros.carbs, macroTargets.carbs);
  const fatPercent = getMacroPercentage(todayMacros.fat, macroTargets.fat);

  const chartData = {
    labels: ['P', 'C', 'F'],
    data: [
      Math.min(proteinPercent / 100, 1),
      Math.min(carbsPercent / 100, 1),
      Math.min(fatPercent / 100, 1),
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Today</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
      </View>

      <View style={styles.content}>
        {/* Calorie Summary */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieText}>
            <Text style={styles.calorieLabel}>Calories</Text>
            <View style={styles.calorieNumbers}>
              <Text style={styles.calorieValue}>{todayMacros.calories}</Text>
              <Text style={styles.calorieTarget}>/ {macroTargets.calories}</Text>
            </View>
            <Text style={styles.calorieRemaining}>
              {remaining.calories > 0 ? `${remaining.calories} remaining` : `${Math.abs(remaining.calories)} over`}
            </Text>
          </View>
          <View style={styles.calorieChart}>
            <View style={[
              styles.progressRing,
              { borderColor: getProgressColor(caloriePercent) }
            ]}>
              <Text style={styles.progressPercent}>{caloriePercent}%</Text>
            </View>
          </View>
        </View>

        {/* Macro Breakdown */}
        <View style={styles.macroGrid}>
          {[
            { label: 'Protein', current: todayMacros.protein, target: macroTargets.protein, unit: 'g', percent: proteinPercent },
            { label: 'Carbs', current: todayMacros.carbs, target: macroTargets.carbs, unit: 'g', percent: carbsPercent },
            { label: 'Fat', current: todayMacros.fat, target: macroTargets.fat, unit: 'g', percent: fatPercent },
          ].map((macro, idx) => (
            <View key={idx} style={styles.macroCard}>
              <Text style={styles.macroCardLabel}>{macro.label}</Text>
              <Text style={styles.macroCardValue}>
                {macro.current}{macro.unit}
              </Text>
              <Text style={styles.macroCardTarget}>/ {macro.target}{macro.unit}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(macro.percent, 100)}%`,
                      backgroundColor: getProgressColor(macro.percent),
                    },
                  ]}
                />
              </View>
              <Text style={styles.macroCardPercent}>{macro.percent}%</Text>
            </View>
          ))}
        </View>

        {/* Meal List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FoodLogging')}>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {mealConfig.meals.length === 0 ? (
            <Text style={styles.emptyText}>No meals logged yet</Text>
          ) : (
            mealConfig.meals.map((meal) => {
              const mealLog = dailyLogs
                .find((log) => log.date === getTodayString())
                ?.foods.filter((f) => f.mealId === meal.id) || [];

              const mealTotals = {
                calories: mealLog.reduce((sum, f) => sum + f.calories, 0),
                protein: mealLog.reduce((sum, f) => sum + f.protein, 0),
                carbs: mealLog.reduce((sum, f) => sum + f.carbs, 0),
                fat: mealLog.reduce((sum, f) => sum + f.fat, 0),
              };

              return (
                <TouchableOpacity
                  key={meal.id}
                  style={styles.mealCard}
                  onPress={() => navigation.navigate('FoodLogging', { mealId: meal.id })}
                >
                  <View style={styles.mealCardContent}>
                    <View>
                      <Text style={styles.mealName}>
                        {meal.name.replace('_', ' ').charAt(0).toUpperCase() + meal.name.replace('_', ' ').slice(1)}
                      </Text>
                      <Text style={styles.mealTime}>
                        {mealLog.length} items · {mealTotals.calories} cal
                      </Text>
                    </View>
                    <View style={styles.mealProgress}>
                      <View style={styles.mealProgressBar}>
                        <View
                          style={[
                            styles.mealProgressFill,
                            {
                              width: `${Math.min((mealTotals.calories / meal.targetCalories) * 100, 100)}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.mealProgressText}>
                        {mealTotals.calories} / {meal.targetCalories}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Water</Text>
              <Text style={styles.statValue}>{todayWater}</Text>
              <Text style={styles.statUnit}>oz</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>{weights.length > 0 ? weights[weights.length - 1].weight : '--'}</Text>
              <Text style={styles.statUnit}>lbs</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => navigation.navigate('FixMyDay')}
          >
            <Text style={styles.actionButtonText}>🔧 Fix My Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.actionButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingTop: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  calorieCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieText: {
    flex: 1,
  },
  calorieLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
    marginBottom: 8,
  },
  calorieNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  calorieTarget: {
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
  },
  calorieRemaining: {
    fontSize: 12,
    color: '#6BCB77',
    fontWeight: '600',
  },
  calorieChart: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  macroCardLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 6,
  },
  macroCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  macroCardTarget: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroCardPercent: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  addButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6BCB77',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  mealCardContent: {
    gap: 10,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  mealTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  mealProgress: {
    gap: 6,
  },
  mealProgressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  mealProgressFill: {
    height: '100%',
    backgroundColor: '#6BCB77',
    borderRadius: 2,
  },
  mealProgressText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statUnit: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  actions: {
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#6BCB77',
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6BCB77',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
