import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAppStore } from '@/store/appStore';
import { calculateBMR, calculateTDEE, calculateMacros, calculateBMI } from '@/utils/calculations';
import { parseHeight } from '@/utils/formatting';
import { UserProfile, MacroTargets } from '@/types/index';

export const OnboardingScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState<'fat_loss' | 'muscle_gain' | 'maintain'>('muscle_gain');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active'>('moderate');

  const { setUser, setMacroTargets } = useAppStore();

  const handleStep1Next = () => {
    if (!age || !heightFeet || !heightInches || !weight || !email) {
      Alert.alert('Please fill in all fields');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    setStep(3);
  };

  const handleComplete = () => {
    try {
      const uid = email.replace('@', '_').replace('.', '_');
      
      const profile: UserProfile = {
        uid,
        email,
        age: parseInt(age),
        sex,
        heightFeet: parseInt(heightFeet),
        heightInches: parseInt(heightInches),
        weightLbs: parseInt(weight),
        bodyFatPercent: bodyFat ? parseInt(bodyFat) : undefined,
        goal,
        activityLevel,
        trackingStyle: 'detailed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(profile);

      const bmr = calculateBMR(profile);
      const tdee = calculateTDEE(bmr, activityLevel);
      const macros = calculateMacros(profile, tdee);

      setMacroTargets(macros);

      const bmi = calculateBMI(parseInt(weight), parseInt(heightFeet), parseInt(heightInches));

      navigation.replace('MealSetup', { profile, macros, bmi });
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding');
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MacroCoach</Text>
        <Text style={styles.subtitle}>Step {step} of 3</Text>

        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>Your Profile</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Sex</Text>
              <View style={styles.segmentControl}>
                <TouchableOpacity
                  style={[styles.segmentButton, sex === 'male' && styles.segmentActive]}
                  onPress={() => setSex('male')}
                >
                  <Text style={[styles.segmentText, sex === 'male' && styles.segmentTextActive]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentButton, sex === 'female' && styles.segmentActive]}
                  onPress={() => setSex('female')}
                >
                  <Text style={[styles.segmentText, sex === 'female' && styles.segmentTextActive]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Height</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 10 }]}
                  placeholder="5"
                  value={heightFeet}
                  onChangeText={setHeightFeet}
                  keyboardType="number-pad"
                />
                <Text style={styles.unitLabel}>ft</Text>
                <TextInput
                  style={[styles.input, { flex: 1, marginLeft: 10 }]}
                  placeholder="10"
                  value={heightInches}
                  onChangeText={setHeightInches}
                  keyboardType="number-pad"
                />
                <Text style={styles.unitLabel}>in</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                placeholder="180"
                value={weight}
                onChangeText={setWeight}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Body Fat % (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="20"
                value={bodyFat}
                onChangeText={setBodyFat}
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleStep1Next}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>Your Goals</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>What's your main goal?</Text>
              <View style={styles.optionsList}>
                {['fat_loss', 'muscle_gain', 'maintain'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.option, goal === g && styles.optionActive]}
                    onPress={() => setGoal(g as any)}
                  >
                    <Text style={[styles.optionText, goal === g && styles.optionTextActive]}>
                      {g === 'fat_loss' ? '🔥 Lose Fat' : g === 'muscle_gain' ? '💪 Build Muscle' : '⚖️ Maintain'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Activity Level</Text>
              <View style={styles.optionsList}>
                {(['sedentary', 'light', 'moderate', 'very_active'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.option, activityLevel === level && styles.optionActive]}
                    onPress={() => setActivityLevel(level)}
                  >
                    <Text style={[styles.optionText, activityLevel === level && styles.optionTextActive]}>
                      {level.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleStep2Next}>
              <Text style={styles.buttonText}>Review Macros</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.stepTitle}>Your Macro Targets</Text>
            <Text style={styles.subtitle}>Daily targets based on your profile</Text>

            {(() => {
              const uid = email.replace('@', '_').replace('.', '_');
              const profile: UserProfile = {
                uid,
                email,
                age: parseInt(age),
                sex,
                heightFeet: parseInt(heightFeet),
                heightInches: parseInt(heightInches),
                weightLbs: parseInt(weight),
                bodyFatPercent: bodyFat ? parseInt(bodyFat) : undefined,
                goal,
                activityLevel,
                trackingStyle: 'detailed',
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              const bmr = calculateBMR(profile);
              const tdee = calculateTDEE(bmr, activityLevel);
              const macros = calculateMacros(profile, tdee);

              return (
                <View style={styles.macroBox}>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>Calories</Text>
                    <Text style={styles.macroValue}>{macros.calories}</Text>
                  </View>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>Protein</Text>
                    <Text style={styles.macroValue}>{macros.protein}g</Text>
                  </View>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <Text style={styles.macroValue}>{macros.carbs}g</Text>
                  </View>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>Fat</Text>
                    <Text style={styles.macroValue}>{macros.fat}g</Text>
                  </View>
                </View>
              );
            })()}

            <TouchableOpacity style={styles.button} onPress={handleComplete}>
              <Text style={styles.buttonText}>Complete Setup</Text>
            </TouchableOpacity>
          </>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitLabel: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 5,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  segmentActive: {
    backgroundColor: '#6BCB77',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  segmentTextActive: {
    color: '#fff',
  },
  optionsList: {
    gap: 12,
  },
  option: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  optionActive: {
    borderColor: '#6BCB77',
    backgroundColor: '#f0f9f6',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  optionTextActive: {
    color: '#6BCB77',
  },
  button: {
    backgroundColor: '#6BCB77',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  macroBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  macroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6BCB77',
  },
});
