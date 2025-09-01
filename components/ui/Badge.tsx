import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, BorderRadius } from '@/constants/design';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[size],
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary[100],
  },
  success: {
    backgroundColor: Colors.success[50],
  },
  warning: {
    backgroundColor: Colors.warning[50],
  },
  error: {
    backgroundColor: Colors.error[50],
  },
  neutral: {
    backgroundColor: Colors.neutral[100],
  },
  
  // Sizes
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  
  // Text styles
  text: {
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryText: {
    color: Colors.primary[700],
  },
  successText: {
    color: Colors.success[600],
  },
  warningText: {
    color: Colors.warning[600],
  },
  errorText: {
    color: Colors.error[600],
  },
  neutralText: {
    color: Colors.neutral[600],
  },
  
  // Size text
  smText: {
    fontSize: Typography.fontSize.xs,
  },
  mdText: {
    fontSize: Typography.fontSize.sm,
  },
});