import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows } from '@/constants/design';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[padding],
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
  },
  
  // Variants
  default: {
    ...Shadows.sm,
  },
  elevated: {
    ...Shadows.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Padding
  none: {
    padding: 0,
  },
  sm: {
    padding: 12,
  },
  md: {
    padding: 20,
  },
  lg: {
    padding: 24,
  },
});