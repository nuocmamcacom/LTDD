import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useChessColors, useChessStyles } from '../../constants/ChessThemeProvider';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  const chessColors = useChessColors();
  const chessStyles = useChessStyles();
  
  return (
    <View style={[chessStyles.loadingContainer, { backgroundColor: chessColors.background }]}>
      <ActivityIndicator size="large" color={chessColors.primary} />
      <Text style={[chessStyles.loadingText, { color: chessColors.textSecondary }]}>{message}</Text>
    </View>
  );
};