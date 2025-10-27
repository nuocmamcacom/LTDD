import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useChessColors, useChessStyles } from '../../constants/ChessThemeProvider';

interface ChessButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ChessButton: React.FC<ChessButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  size = 'medium',
  disabled,
  style,
  ...props
}) => {
  const chessColors = useChessColors();
  const chessStyles = useChessStyles();

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return chessStyles.buttonSecondary;
      case 'outline':
        return chessStyles.buttonOutline;
      default:
        return chessStyles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return chessStyles.buttonTextSecondary;
      case 'outline':
        return chessStyles.buttonTextOutline;
      default:
        return chessStyles.buttonText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 12, paddingVertical: 8 };
      case 'large':
        return { paddingHorizontal: 32, paddingVertical: 16 };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || loading}
      style={[
        getButtonStyle(),
        getSizeStyle(),
        disabled && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? chessColors.textInverse : chessColors.primary} 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};