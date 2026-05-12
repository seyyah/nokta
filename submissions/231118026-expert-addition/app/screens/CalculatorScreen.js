import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATALOG } from '../data/catalog';
import { CALCULATORS } from '../data/calculatorDefs';

function StepperField({ field, value, onAdjust }) {
  const isBinary = field.min === 0 && field.max === 1;

  if (isBinary) {
    const checked = value === 1;
    return (
      <TouchableOpacity
        style={[styles.binaryRow, checked && styles.binaryRowActive]}
        onPress={() => onAdjust(checked ? -1 : 1)}
        activeOpacity={0.75}
      >
        <View style={[styles.checkbox, checked && styles.checkboxActive]}>
          {checked && <Ionicons name="checkmark" size={12} color="#121415" />}
        </View>
        <Text style={[styles.binaryLabel, checked && styles.binaryLabelActive]}>{field.label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.stepperRow}>
      <View style={styles.stepperLeft}>
        <Text style={styles.fieldLabel}>{field.label}</Text>
        {field.hint && <Text style={styles.fieldHint}>{field.hint}</Text>}
      </View>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onAdjust(-1)}
          disabled={value <= field.min}
        >
          <Ionicons name="remove" size={16} color={value <= field.min ? '#343536' : '#e3e2e3'} />
        </TouchableOpacity>
        <Text style={styles.stepVal}>{value}</Text>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onAdjust(1)}
          disabled={value >= field.max}
        >
          <Ionicons name="add" size={16} color={value >= field.max ? '#343536' : '#e3e2e3'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CalculatorScreen({ navigation, route }) {
  const { calculatorId, specialty } = route.params || {};
  const calc = CALCULATORS[calculatorId];
  const accent = CATALOG[specialty]?.accentColor || '#abcbdf';

  const [values, setValues] = useState(() => {
    const init = {};
    calc?.fields.forEach((f) => { init[f.id] = f.default; });
    return init;
  });

  const adjust = useCallback((id, delta) => {
    setValues((prev) => {
      const field = calc.fields.find((f) => f.id === id);
      const next = Math.max(field.min, Math.min(field.max, (prev[id] ?? field.default) + delta));
      return { ...prev, [id]: next };
    });
  }, [calc]);

  if (!calc) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color="#e3e2e3" />
        </TouchableOpacity>
        <Text style={styles.errorText}>Calculator not found.</Text>
      </View>
    );
  }

  const result = calc.compute(values);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color="#e3e2e3" />
      </TouchableOpacity>

      <Text style={[styles.title, { color: accent }]}>{calc.title}</Text>
      <Text style={styles.subtitle}>{calc.subtitle}</Text>

      <ScrollView style={styles.fields} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {calc.fields.map((field) => (
          <StepperField
            key={field.id}
            field={field}
            value={values[field.id] ?? field.default}
            onAdjust={(delta) => adjust(field.id, delta)}
          />
        ))}

        <Text style={styles.sourceLabel}>{calc.source}</Text>
        <View style={{ height: 160 }} />
      </ScrollView>

      <View style={[styles.resultBar, { borderColor: result.color + '55', backgroundColor: result.color + '0d' }]}>
        <View style={styles.resultHeader}>
          <Text style={[styles.resultScore, { color: result.color }]}>{result.score}</Text>
          <Text style={[styles.resultLabel, { color: result.color }]}>{result.label}</Text>
        </View>
        <Text style={styles.resultRec}>{result.rec}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121415', paddingTop: 64, paddingHorizontal: 24 },
  back: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B6B6B', marginBottom: 24 },
  fields: { flex: 1 },

  binaryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e2021', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#292a2b',
  },
  binaryRowActive: { borderColor: '#abcbdf44', backgroundColor: '#abcbdf0d' },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
    borderColor: '#343536', justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#abcbdf', borderColor: '#abcbdf' },
  binaryLabel: { fontSize: 13, color: '#c2c7cc', flex: 1, lineHeight: 18 },
  binaryLabelActive: { color: '#e3e2e3', fontWeight: '500' },

  stepperRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e2021', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#292a2b',
    gap: 12,
  },
  stepperLeft: { flex: 1 },
  fieldLabel: { fontSize: 13, color: '#e3e2e3', fontWeight: '500', marginBottom: 3 },
  fieldHint: { fontSize: 11, color: '#6B6B6B', lineHeight: 15 },

  stepper: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
  },
  stepBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#292a2b', justifyContent: 'center', alignItems: 'center',
  },
  stepVal: {
    fontSize: 17, fontWeight: 'bold', color: '#e3e2e3',
    width: 32, textAlign: 'center',
  },

  sourceLabel: { fontSize: 10, color: '#343536', marginTop: 16, textAlign: 'center', fontStyle: 'italic' },
  errorText: { color: '#6B6B6B', fontSize: 15, textAlign: 'center', marginTop: 40 },

  resultBar: {
    position: 'absolute', bottom: 32, left: 24, right: 24,
    borderRadius: 16, padding: 16,
    borderWidth: 1,
    backgroundColor: '#1e2021',
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  resultScore: { fontSize: 22, fontWeight: 'bold' },
  resultLabel: { fontSize: 15, fontWeight: '600' },
  resultRec: { fontSize: 12, color: '#c2c7cc', lineHeight: 17 },
});
