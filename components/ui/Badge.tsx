import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, BorderRadius } from '@/constants/design';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'accent' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'md',
  style,
  icon,
}) => {
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[size],
    icon && { paddingLeft: size === 'xs' ? 4 : size === 'sm' ? 6 : 8 },
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  return (
    <View style={badgeStyle}>
      {icon && icon}
      <Text style={textStyle}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 4,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary[100],
  },
  accent: {
    backgroundColor: Colors.accent[100],
  },
  success: {
    backgroundColor: Colors.success[100],
  },
  warning: {
    backgroundColor: Colors.warning[100],
  },
  error: {
    backgroundColor: Colors.error[100],
  },
  info: {
    backgroundColor: Colors.info[100],
  },
  neutral: {
    backgroundColor: Colors.neutral[100],
  },
  
  // Sizes
  xs: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  lg: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  
  // Text styles
  text: {
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryText: {
    color: Colors.primary[700],
  },
  accentText: {
    color: Colors.accent[700],
  },
  successText: {
    color: Colors.success[700],
  },
  warningText: {
    color: Colors.warning[700],
  },
  errorText: {
    color: Colors.error[700],
  },
  infoText: {
    color: Colors.info[700],
  },
  neutralText: {
    color: Colors.neutral[700],
  },
  
  // Size text
  xsText: {
    fontSize: 10,
  },
  smText: {
    fontSize: Typography.fontSize.xs,
  },
  mdText: {
    fontSize: Typography.fontSize.sm,
  },
  lgText: {
    fontSize: Typography.fontSize.base,
  },
});