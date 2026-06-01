import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAppStore } from '@/store/appStore';
import { claudeService } from '@/services/claude';
import { getTodayString } from '@/utils/formatting';
import { FixMyDayResponse } from '@/types/index';

export const FixMyDayScreen = ({ navigation }: any) => {
  const { dailyLogs, macroTargets } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<FixMyDayResponse | null>(null);

  const getTodayFoods = () => {
    const today = getTodayString();
    const todayLog = dailyLogs.find((log) => log.date === today);
    return todayLog?.foods || [];
  };

  const getTodayMacros = () => {
    const foods = getTodayFoods();
    return {
      calories: foods.reduce((sum, f) => sum + f.calories, 0),
      protein: foods.reduce((sum, f) => sum + f.protein, 0),
      carbs: foods.reduce((sum, f) => sum + f.carbs, 0),
      fat: foods.reduce((sum, f) => sum + f.fat, 0),
    };
  };

  const generateResponse = async () => {
    if (!macroTargets) return;

    setLoading(true);
    try {
      const foods = getTodayFoods().map((f) => f.foodName);
      const currentMacros = getTodayMacros();

      const result = await claudeService.generateFixMyDayResponse(
        foods,
        currentMacros,
        {
          calories: macroTargets.calories,
          protein: macroTargets.protein,
          carbs: macroTargets.carbs,
          fat: macroTargets.fat,
        }
      );

      setResponse(result);
    } catch (error) {
      console.error('Error generating response:', error);
      Alert.alert('Error', 'Failed to generate coaching response');
    } finally {
      setLoading(false);
    }
  };

  const currentMacros = getTodayMacros();
  const foodsList = getTodayFoods();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fix My Day</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>

          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Calories</Text>
              <Text style={styles.progressValue}>
                {currentMacros.calories} / {macroTargets?.calories}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((currentMacros.calories / (macroTargets?.calories || 1)) * 100, 100)}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.macroGrid}>
              {[
                { label: 'Protein', current: currentMacros.protein, target: macroTargets?.protein || 0, unit: 'g' },
                { label: 'Carbs', current: currentMacros.carbs, target: macroTargets?.carbs || 0, unit: 'g' },
                { label: 'Fat', current: currentMacros.fat, target: macroTargets?.fat || 0, unit: 'g' },
              ].map((macro, idx) => (
                <View key={idx} style={styles.microMacro}>
                  <Text style={styles.microMacroLabel}>{macro.label}</Text>
                  <Text style={styles.microMacroValue}>
                    {macro.current}{macro.unit}
                  </Text>
                  <Text style={styles.microMacroTarget}>/ {macro.target}{macro.unit}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foods Logged ({foodsList.length})</Text>

          {foodsList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No foods logged yet</Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('FoodLogging')}
              >
                <Text style={styles.linkButtonText}>Log some food →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.foodsList}>
              {foodsList.map((food, idx) => (
                <View key={idx} style={styles.foodItem}>
                  <View style={styles.foodItemContent}>
                    <Text style={styles.foodName}>{food.foodName}</Text>
                    <Text style={styles.foodMacro}>
                      {food.calories} cal • {food.protein}g P • {food.carbs}g C • {food.fat}g F
                    </Text>
                  </View>
                  <Text style={styles.foodQuantity}>{food.quantity}x</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {!response && (
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.generateButtonDisabled]}
            onPress={generateResponse}
            disabled={loading || foodsList.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.generateButtonText}>🤖 Get AI Coaching</Text>
            )}
          </TouchableOpacity>
        )}

        {response && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Coaching</Text>

            <View style={styles.coachingCard}>
              <Text style={styles.analysisTitle}>Analysis</Text>
              <Text style={styles.analysisText}>{response.analysis}</Text>
            </View>

            {response.suggestions.length > 0 && (
              <View style={styles.coachingCard}>
                <Text style={styles.analysisTitle}>💡 Suggestions</Text>
                {response.suggestions.map((sugg, idx) => (
                  <View key={idx} style={styles.suggestionItem}>
                    <Text style={styles.suggestionName}>{sugg.name}</Text>
                    <Text style={styles.suggestionDesc}>{sugg.description}</Text>
                    <Text style={styles.suggestionMacro}>
                      {sugg.calories} cal • {sugg.protein}g P • {sugg.carbs}g C • {sugg.fat}g F
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {response.swaps.length > 0 && (
              <View style={styles.coachingCard}>
                <Text style={styles.analysisTitle}>🔄 Smart Swaps</Text>
                {response.swaps.map((swap, idx) => (
                  <View key={idx} style={styles.swapItem}>
                    <View style={styles.swapFromTo}>
                      <View style={styles.swapFrom}>
                        <Text style={styles.swapLabel}>From</Text>
                        <Text style={styles.swapFood}>{swap.from}</Text>
                      </View>
                      <Text style={styles.swapArrow}>→</Text>
                      <View style={styles.swapTo}>
                        <Text style={styles.swapLabel}>To</Text>
                        <Text style={styles.swapFood}>{swap.to}</Text>
                      </View>
                    </View>
                    <Text style={styles.swapReason}>{swap.reason}</Text>
                  </View>
                ))}
              </View>
            )}

            {response.adjustments.length > 0 && (
              <View style={styles.coachingCard}>
                <Text style={styles.analysisTitle}>📝 Tips</Text>
                {response.adjustments.map((adj, idx) => (
                  <View key={idx} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{adj}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => setResponse(null)}
            >
              <Text style={styles.generateButtonText}>← Get New Suggestions</Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6BCB77',
    borderRadius: 4,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  microMacro: {
    alignItems: 'center',
  },
  microMacroLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  microMacroValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  microMacroTarget: {
    fontSize: 11,
    color: '#999',
  },
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  linkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  linkButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6BCB77',
  },
  foodsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodItemContent: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  foodMacro: {
    fontSize: 12,
    color: '#999',
  },
  foodQuantity: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6BCB77',
    marginLeft: 12,
  },
  coachingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  analysisText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  suggestionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  suggestionDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  suggestionMacro: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  swapItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  swapFromTo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  swapFrom: {
    flex: 1,
  },
  swapTo: {
    flex: 1,
  },
  swapLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    marginBottom: 2,
  },
  swapFood: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  swapArrow: {
    fontSize: 14,
    color: '#6BCB77',
    marginHorizontal: 8,
  },
  swapReason: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  tipItem: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#6BCB77',
    marginRight: 8,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  generateButton: {
    backgroundColor: '#6BCB77',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
