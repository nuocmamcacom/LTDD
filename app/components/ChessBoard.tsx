import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useChessColors, useChessStyles } from '../../constants/ChessThemeProvider';

interface ChessBoardProps {
  size?: number;
  interactive?: boolean;
  onSquarePress?: (row: number, col: number) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  size = 300,
  interactive = false,
  onSquarePress,
}) => {
  const chessColors = useChessColors();
  const chessStyles = useChessStyles();

  const squareSize = size / 8;

  const renderSquare = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    const squareStyle = [
      styles.square,
      {
        width: squareSize,
        height: squareSize,
        backgroundColor: isLight ? chessColors.boardLight : chessColors.boardDark,
      },
    ];

    const SquareComponent = interactive ? TouchableOpacity : View;

    return (
      <SquareComponent
        key={`${row}-${col}`}
        style={squareStyle}
        onPress={interactive ? () => onSquarePress?.(row, col) : undefined}
        {...(Platform.OS === 'web' && {
          onMouseEnter: (e: any) => {
            if (interactive) {
              e.target.style.boxShadow = `inset 0 0 0 2px ${chessColors.primary}`;
            }
          },
          onMouseLeave: (e: any) => {
            if (interactive) {
              e.target.style.boxShadow = '';
            }
          },
        })}
      >
        {/* Add chess pieces here if needed */}
      </SquareComponent>
    );
  };

  const renderRow = (row: number) => {
    const squares = [];
    for (let col = 0; col < 8; col++) {
      squares.push(renderSquare(row, col));
    }
    return (
      <View key={row} style={styles.row}>
        {squares}
      </View>
    );
  };

  const renderBoard = () => {
    const rows = [];
    for (let row = 0; row < 8; row++) {
      rows.push(renderRow(row));
    }
    return rows;
  };

  return (
    <View style={[chessStyles.chessBoard, { width: size, height: size }]}>
      {renderBoard()}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});