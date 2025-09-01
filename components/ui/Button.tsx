import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Colors, Typography, BorderRadius, Shadows, Layout } from '@/constants/design';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? Colors.text.inverse : Colors.primary[500]} 
        />
      ) : (
        <>
          {icon}
          <Text style={textStyleCombined}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    gap: 8,
    ...Shadows.sm,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary[500],
  },
  secondary: {
    backgroundColor: Colors.neutral[100],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: Layout.buttonHeight,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  
  // Text styles
  text: {
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.normal,
  },
  primaryText: {
    color: Colors.text.inverse,
  },
  secondaryText: {
    color: Colors.text.primary,
  },
  outlineText: {
    color: Colors.primary[500],
  },
  ghostText: {
    color: Colors.primary[500],
  },
  
  // Size text
  smText: {
    fontSize: Typography.fontSize.sm,
  },
  mdText: {
    fontSize: Typography.fontSize.base,
  },
  lgText: {
    fontSize: Typography.fontSize.lg,
  },
  
  // States
  disabled: {
    backgroundColor: Colors.neutral[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: Colors.neutral[400],
  },
});