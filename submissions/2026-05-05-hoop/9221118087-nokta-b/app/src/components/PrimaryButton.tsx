import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { AppPalette } from '../theme/palette';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  palette: AppPalette;
  disabled?: boolean;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

function getVariantStyles(variant: ButtonVariant, palette: AppPalette): { container: ViewStyle; label: TextStyle } {
  if (variant === 'secondary') {
    return {
      container: {
        backgroundColor: palette.cardSoft,
        borderColor: palette.border,
        borderWidth: 1
      },
      label: {
        color: palette.textPrimary
      }
    };
  }

  if (variant === 'ghost') {
    return {
      container: {
        backgroundColor: 'transparent',
        borderColor: palette.border,
        borderWidth: 1
      },
      label: {
        color: palette.textSecondary
      }
    };
  }

  return {
    container: {
      backgroundColor: palette.accent,
      borderColor: palette.accent,
      borderWidth: 1
    },
    label: {
      color: '#F7FFFE'
    }
  };
}

export function PrimaryButton({
  label,
  onPress,
  palette,
  disabled = false,
  variant = 'primary',
  fullWidth = false
}: PrimaryButtonProps) {
  const variantStyles = getVariantStyles(variant, palette);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles.container,
        fullWidth ? styles.fullWidth : styles.shrink,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <Text style={[styles.label, variantStyles.label]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  disabled: {
    opacity: 0.55
  },
  fullWidth: {
    width: '100%'
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  shrink: {
    flexShrink: 1
  }
});
