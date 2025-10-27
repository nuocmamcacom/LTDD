/**
 * Chess.com inspired global styles and components
 * Reusable style components based on Chess.com design system
 */

import { Platform, StyleSheet } from 'react-native';
import { ChessBorderRadius, ChessColors, ChessFonts, ChessShadows, ChessSpacing, ChessTypography } from './chessTheme';

export const createChessStyles = (isDark: boolean = false) => {
  const colors = isDark ? ChessColors.dark : ChessColors.light;
  
  return StyleSheet.create({
    // Layout styles
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: ChessSpacing.md,
    },
    
    scrollContainer: {
      flexGrow: 1,
      backgroundColor: colors.background,
    },
    
    // Header styles
    header: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: ChessSpacing.md,
      paddingVertical: ChessSpacing.sm,
      ...ChessShadows.small,
    },
    
    headerTitle: {
      ...ChessTypography.h3,
      color: colors.text,
      fontFamily: ChessFonts.primary,
      textAlign: 'center',
    },
    
    // Card styles (Chess.com style cards)
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: ChessBorderRadius.md,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: ChessSpacing.md,
      marginVertical: ChessSpacing.xs,
      ...ChessShadows.small,
    },
    
    cardLarge: {
      backgroundColor: colors.cardBackground,
      borderRadius: ChessBorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: ChessSpacing.lg,
      margin: ChessSpacing.md,
      ...ChessShadows.medium,
    },
    
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: ChessSpacing.sm,
      paddingBottom: ChessSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    
    // Button styles (Chess.com green theme)
    buttonPrimary: {
      backgroundColor: colors.buttonPrimary,
      paddingHorizontal: ChessSpacing.lg,
      paddingVertical: ChessSpacing.md,
      borderRadius: ChessBorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      ...ChessShadows.small,
    },
    
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.buttonPrimary,
      paddingHorizontal: ChessSpacing.lg,
      paddingVertical: ChessSpacing.md,
      borderRadius: ChessBorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: ChessSpacing.md,
      paddingVertical: ChessSpacing.sm,
      borderRadius: ChessBorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    buttonText: {
      ...ChessTypography.button,
      color: colors.textInverse,
      fontFamily: ChessFonts.primary,
      fontWeight: '600',
    },
    
    buttonTextSecondary: {
      ...ChessTypography.button,
      color: colors.buttonPrimary,
      fontFamily: ChessFonts.primary,
      fontWeight: '600',
    },
    
    buttonTextOutline: {
      ...ChessTypography.button,
      color: colors.text,
      fontFamily: ChessFonts.primary,
      fontWeight: '500',
    },
    
    // Input styles
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: ChessBorderRadius.sm,
      paddingHorizontal: ChessSpacing.md,
      paddingVertical: ChessSpacing.sm,
      fontSize: ChessTypography.body.fontSize,
      color: colors.text,
      fontFamily: ChessFonts.primary,
    },
    
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
      ...ChessShadows.small,
    },
    
    inputError: {
      borderColor: colors.error,
      backgroundColor: colors.background,
    },
    
    // Text styles
    textPrimary: {
      ...ChessTypography.body,
      color: colors.text,
      fontFamily: ChessFonts.primary,
    },
    
    textSecondary: {
      ...ChessTypography.body,
      color: colors.textSecondary,
      fontFamily: ChessFonts.primary,
    },
    
    textTertiary: {
      ...ChessTypography.bodySmall,
      color: colors.textTertiary,
      fontFamily: ChessFonts.primary,
    },
    
    textTitle: {
      ...ChessTypography.h2,
      color: colors.text,
      fontFamily: ChessFonts.primary,
      fontWeight: '700',
    },
    
    textSubtitle: {
      ...ChessTypography.h4,
      color: colors.textSecondary,
      fontFamily: ChessFonts.primary,
      fontWeight: '600',
    },
    
    textLabel: {
      ...ChessTypography.label,
      color: colors.text,
      fontFamily: ChessFonts.primary,
      fontWeight: '600',
      marginBottom: ChessSpacing.xs,
    },
    
    textCaption: {
      ...ChessTypography.caption,
      color: colors.textTertiary,
      fontFamily: ChessFonts.primary,
    },
    
    textLink: {
      ...ChessTypography.body,
      color: colors.primary,
      fontFamily: ChessFonts.primary,
      textDecorationLine: 'underline',
    },
    
    // Chess board related styles
    chessBoard: {
      aspectRatio: 1,
      backgroundColor: colors.boardLight,
      borderRadius: ChessBorderRadius.sm,
      borderWidth: 2,
      borderColor: colors.border,
      ...ChessShadows.medium,
    },
    
    chessBoardSquare: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    chessBoardSquareLight: {
      backgroundColor: colors.boardLight,
    },
    
    chessBoardSquareDark: {
      backgroundColor: colors.boardDark,
    },
    
    // Navigation styles
    tabBar: {
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: Platform.select({ ios: 20, default: 0 }),
      ...ChessShadows.small,
    },
    
    tabBarItem: {
      paddingVertical: ChessSpacing.sm,
    },
    
    tabBarLabel: {
      ...ChessTypography.caption,
      fontFamily: ChessFonts.primary,
      fontWeight: '600',
    },
    
    // Status indicators
    badge: {
      backgroundColor: colors.primary,
      paddingHorizontal: ChessSpacing.sm,
      paddingVertical: ChessSpacing.xs,
      borderRadius: ChessBorderRadius.full,
      alignSelf: 'flex-start',
    },
    
    badgeText: {
      ...ChessTypography.caption,
      color: colors.textInverse,
      fontFamily: ChessFonts.primary,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    
    badgeSuccess: {
      backgroundColor: colors.success,
    },
    
    badgeWarning: {
      backgroundColor: colors.warning,
    },
    
    badgeError: {
      backgroundColor: colors.error,
    },
    
    // Loading and states
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    
    loadingText: {
      ...ChessTypography.body,
      color: colors.textSecondary,
      fontFamily: ChessFonts.primary,
      marginTop: ChessSpacing.md,
    },
    
    // Grid layouts
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -ChessSpacing.xs,
    },
    
    gridItem: {
      paddingHorizontal: ChessSpacing.xs,
    },
    
    gridItemHalf: {
      width: '50%',
    },
    
    gridItemThird: {
      width: '33.333%',
    },
    
    gridItemQuarter: {
      width: '25%',
    },
    
    // Spacing utilities
    marginXs: { margin: ChessSpacing.xs },
    marginSm: { margin: ChessSpacing.sm },
    marginMd: { margin: ChessSpacing.md },
    marginLg: { margin: ChessSpacing.lg },
    marginXl: { margin: ChessSpacing.xl },
    
    paddingXs: { padding: ChessSpacing.xs },
    paddingSm: { padding: ChessSpacing.sm },
    paddingMd: { padding: ChessSpacing.md },
    paddingLg: { padding: ChessSpacing.lg },
    paddingXl: { padding: ChessSpacing.xl },
    
    // Flex utilities
    flex1: { flex: 1 },
    flexRow: { flexDirection: 'row' },
    flexColumn: { flexDirection: 'column' },
    justifyCenter: { justifyContent: 'center' },
    alignCenter: { alignItems: 'center' },
    justifyBetween: { justifyContent: 'space-between' },
    justifyAround: { justifyContent: 'space-around' },
    justifyEvenly: { justifyContent: 'space-evenly' },
    
    // Position utilities
    absolute: { position: 'absolute' },
    relative: { position: 'relative' },
    
    // Border utilities
    borderTop: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    borderLeft: {
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
    },
    borderRight: {
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    
    // Web-specific styles
    ...(Platform.OS === 'web' && {
      webContainer: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
      },
      
      webCardHover: {
        transform: [{ scale: 1.02 }],
        ...ChessShadows.medium,
      },
      
      webButtonHover: {
        backgroundColor: colors.buttonHover,
      },
    }),
  });
};

// Export default styles for light mode
export const ChessStyles = createChessStyles(false);
export const ChessStylesDark = createChessStyles(true);