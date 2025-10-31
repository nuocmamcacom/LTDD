/**
 * Chess.com Style Demo Component
 * Demonstrates the Chess.com inspired design system
 */

import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useChessColors, useChessStyles, useChessTheme } from '../../constants/ChessThemeProvider';

const ChessStyleDemo: React.FC = () => {
  const theme = useChessTheme();
  const styles = useChessStyles();
  const colors = useChessColors();
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chess.com Style Demo ♔</Text>
      </View>

      {/* Theme Toggle */}
      <View style={[styles.card, styles.marginMd]}>
        <View style={styles.cardHeader}>
          <Text style={styles.textTitle}>Theme Settings</Text>
        </View>
        <View style={[styles.flexRow, styles.alignCenter, styles.justifyBetween]}>
          <Text style={styles.textPrimary}>Dark Mode</Text>
          <Switch
            value={theme.isDark}
            onValueChange={theme.toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={theme.isDark ? colors.textInverse : colors.text}
          />
        </View>
      </View>

      {/* Typography */}
      <View style={[styles.card, styles.marginMd]}>
        <Text style={styles.textTitle}>Typography</Text>
        <Text style={[styles.textSubtitle, styles.marginSm]}>Subtitle Text</Text>
        <Text style={[styles.textPrimary, styles.marginSm]}>
          Primary body text with good readability and Chess.com styling.
        </Text>
        <Text style={[styles.textSecondary, styles.marginSm]}>
          Secondary text for less important information.
        </Text>
        <Text style={[styles.textTertiary, styles.marginSm]}>
          Tertiary text for captions and metadata.
        </Text>
        <TouchableOpacity onPress={() => showAlert('Link', 'Link pressed!')}>
          <Text style={styles.textLink}>This is a clickable link</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons */}
      <View style={[styles.card, styles.marginMd]}>
        <Text style={[styles.textTitle, styles.marginMd]}>Buttons</Text>
        
        <TouchableOpacity
          style={[styles.buttonPrimary, styles.marginSm]}
          onPress={() => showAlert('Primary', 'Primary button pressed!')}
        >
          <Text style={styles.buttonText}>Primary Button</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonSecondary, styles.marginSm]}
          onPress={() => showAlert('Secondary', 'Secondary button pressed!')}
        >
          <Text style={styles.buttonTextSecondary}>Secondary Button</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonOutline, styles.marginSm]}
          onPress={() => showAlert('Outline', 'Outline button pressed!')}
        >
          <Text style={styles.buttonTextOutline}>Outline Button</Text>
        </TouchableOpacity>
      </View>

      {/* Form Elements */}
      <View style={[styles.card, styles.marginMd]}>
        <Text style={[styles.textTitle, styles.marginMd]}>Form Elements</Text>
        
        <Text style={styles.textLabel}>Email Address</Text>
        <TextInput
          style={[styles.input, styles.marginSm]}
          placeholder="Enter your email"
          placeholderTextColor={colors.textTertiary}
          value={inputValue}
          onChangeText={setInputValue}
        />

        <Text style={styles.textLabel}>Password</Text>
        <TextInput
          style={[styles.input, styles.marginSm]}
          placeholder="Enter your password"
          placeholderTextColor={colors.textTertiary}
          secureTextEntry
        />

        <View style={[styles.flexRow, styles.alignCenter, styles.marginSm]}>
          <Switch
            value={switchValue}
            onValueChange={setSwitchValue}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={switchValue ? colors.textInverse : colors.text}
          />
          <Text style={[styles.textPrimary, { marginLeft: theme.spacing.sm }]}>
            Remember me
          </Text>
        </View>
      </View>

      {/* Status Badges */}
      <View style={[styles.card, styles.marginMd]}>
        <Text style={[styles.textTitle, styles.marginMd]}>Status Badges</Text>
        
        <View style={[styles.flexRow, styles.marginSm]}>
          <View style={[styles.badge, styles.marginXs]}>
            <Text style={styles.badgeText}>Online</Text>
          </View>
          <View style={[styles.badge, styles.badgeSuccess, styles.marginXs]}>  
            <Text style={styles.badgeText}>Success</Text>
          </View>
          <View style={[styles.badge, styles.badgeWarning, styles.marginXs]}>
            <Text style={styles.badgeText}>Warning</Text>
          </View>
          <View style={[styles.badge, styles.badgeError, styles.marginXs]}>
            <Text style={styles.badgeText}>Error</Text>
          </View>
        </View>
      </View>

      {/* Grid Layout */}
      <View style={[styles.card, styles.marginMd]}>
        <Text style={[styles.textTitle, styles.marginMd]}>Grid Layout</Text>
        
        <View style={styles.gridContainer}>
          <View style={[styles.gridItem, styles.gridItemHalf]}>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={styles.textPrimary}>Grid Item 1</Text>
              <Text style={styles.textSecondary}>Half width</Text>
            </View>
          </View>
          <View style={[styles.gridItem, styles.gridItemHalf]}>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={styles.textPrimary}>Grid Item 2</Text>
              <Text style={styles.textSecondary}>Half width</Text>
            </View>
          </View>
        </View>

        <View style={styles.gridContainer}>
          <View style={[styles.gridItem, styles.gridItemThird]}>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={styles.textSecondary}>1/3</Text>
            </View>
          </View>
          <View style={[styles.gridItem, styles.gridItemThird]}>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={styles.textSecondary}>1/3</Text>
            </View>
          </View>
          <View style={[styles.gridItem, styles.gridItemThird]}>
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={styles.textSecondary}>1/3</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Chess Board Preview */}
      <View style={[styles.card, styles.marginMd]}>
        <Text style={[styles.textTitle, styles.marginMd]}>Chess Board Colors</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: theme.spacing.md }}>
          <View style={styles.chessBoard}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              {[0, 1, 2, 3].map(col => (
                <View key={col} style={{ flex: 1, flexDirection: 'column' }}>
                  {[0, 1, 2, 3].map(row => (
                    <View
                      key={`${row}-${col}`}
                      style={[
                        styles.chessBoardSquare,
                        (row + col) % 2 === 0 
                          ? styles.chessBoardSquareLight 
                          : styles.chessBoardSquareDark
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
        
        <View style={[styles.flexRow, styles.justifyBetween]}>
          <View style={[styles.flexRow, styles.alignCenter]}>
            <View style={[
              { width: 20, height: 20, marginRight: theme.spacing.xs },
              styles.chessBoardSquareLight
            ]} />
            <Text style={styles.textSecondary}>Light Squares</Text>
          </View>
          <View style={[styles.flexRow, styles.alignCenter]}>
            <View style={[
              { width: 20, height: 20, marginRight: theme.spacing.xs },
              styles.chessBoardSquareDark  
            ]} />
            <Text style={styles.textSecondary}>Dark Squares</Text>
          </View>
        </View>
      </View>

      {/* Color Palette */}
      <View style={[styles.card, styles.marginMd]}>
        <Text style={[styles.textTitle, styles.marginMd]}>Color Palette</Text>
        
        <View style={styles.gridContainer}>
          <View style={[styles.gridItem, styles.gridItemHalf]}>
            <View style={[
              styles.card,
              { backgroundColor: colors.primary, height: 60, justifyContent: 'center' }
            ]}>
              <Text style={[styles.textPrimary, { color: colors.textInverse, textAlign: 'center' }]}>
                Primary
              </Text>
            </View>
            <Text style={[styles.textCaption, { textAlign: 'center', marginTop: 4 }]}>
              {colors.primary}
            </Text>
          </View>
          
          <View style={[styles.gridItem, styles.gridItemHalf]}>
            <View style={[
              styles.card,
              { backgroundColor: colors.backgroundSecondary, height: 60, justifyContent: 'center' }
            ]}>
              <Text style={[styles.textPrimary, { textAlign: 'center' }]}>
                Secondary
              </Text>
            </View>
            <Text style={[styles.textCaption, { textAlign: 'center', marginTop: 4 }]}>
              {colors.backgroundSecondary}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: theme.spacing.xl }} />
    </ScrollView>
  );
};

export default ChessStyleDemo;