import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';

interface HeatBarProps {
  value: number;
  maxValue?: number;
  label?: string;
  showLabel?: boolean;
  height?: number;
  style?: object;
}

/**
 * HeatBar component for visualizing student behavior scores
 * Positive values are shown in blue, negative values in red
 */
export default function HeatBar({
  value,
  maxValue = 10,
  label = 'Behavior Heat',
  showLabel = true,
  height = 12,
  style = {}
}: HeatBarProps) {
  // Calculate percentage for progress bar (0-1 range)
  const percent = Math.min(1, Math.abs(value) / maxValue);
  
  // Determine color based on value (positive = blue, negative = red)
  const barColor = value >= 0 ? '#1976D2' : '#D32F2F';
  
  // Format the score label
  const scoreLabel = `${value >= 0 ? '+' : ''}${value} / ${maxValue}`;

  return (
    <View style={[styles.container, style]}>
      {showLabel && <Text style={styles.label}>{label}</Text>}
      <View style={styles.barContainer}>
        <ProgressBar 
          progress={percent} 
          color={barColor} 
          style={[styles.bar, { height }]} 
        />
      </View>
      <Text style={[styles.score, { color: barColor }]}>{scoreLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    color: '#212121',
  },
  barContainer: {
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
  bar: {
    height: 12,
    borderRadius: 6,
  },
  score: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  }
});