import React from 'react';
import { View, ViewProps } from 'react-native';
import { useChessColors, useChessStyles } from '../../constants/ChessThemeProvider';

interface ChessCardProps extends ViewProps {
  variant?: 'default' | 'large';
  elevated?: boolean;
}

export const ChessCard: React.FC<ChessCardProps> = ({
  children,
  variant = 'default',
  elevated = false,
  style,
  ...props
}) => {
  const chessColors = useChessColors();
  const chessStyles = useChessStyles();

  const getCardStyle = () => {
    switch (variant) {
      case 'large':
        return chessStyles.cardLarge;
      default:
        return chessStyles.card;
    }
  };

  const getElevationStyle = () => {
    if (elevated) {
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      };
    }
    return {};
  };

  return (
    <View
      {...props}
      style={[
        getCardStyle(),
        getElevationStyle(),
        { backgroundColor: chessColors.cardBackground },
        style,
      ]}
    >
      {children}
    </View>
  );
};