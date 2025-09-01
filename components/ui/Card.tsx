import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/design';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
  onPress,
  disabled = false,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[padding],
    disabled && { opacity: 0.6 },
    style,
  ];

  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={cardStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.95 : 1}
    >
      {children}
    </CardComponent>
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
    borderColor: Colors.border.medium,
    shadowOpacity: 0,
    elevation: 0,
  },
  glass: {
    backgroundColor: Colors.background.glass,
    ...Shadows.glass,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  gradient: {
    backgroundColor: Colors.accent[50],
    borderWidth: 1,
    borderColor: Colors.accent[200],
    ...Shadows.md,
  },
  
  // Padding
  none: {
    padding: 0,
  },
  xs: {
    padding: Spacing.sm,
  },
  sm: {
    padding: Spacing.md,
  },
  md: {
    padding: Spacing.xl,
  },
  lg: {
    padding: Spacing['2xl'],
  },
  xl: {
    padding: Spacing['3xl'],
  },
});