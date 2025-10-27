/**
 * Global CSS styles for web platform
 * Chess.com inspired web styles with responsive design
 */

import { Platform } from 'react-native';
import { chessWebStyles } from './chessWebStyles';

export const injectGlobalWebStyles = () => {
  if (Platform.OS !== 'web') return;

  // Inject Chess.com styles first
  const chessStyle = document.createElement('style');
  chessStyle.innerHTML = chessWebStyles;
  document.head.appendChild(chessStyle);

  // Then inject additional styles
  const style = document.createElement('style');
  style.innerHTML = `
    /* Chess.com inspired global styles */
    
    * {
      box-sizing: border-box;
    }
    
    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      scroll-behavior: smooth;
    }
    
    #root, #__next {
      min-height: 100vh;
      background-color: #ffffff;
    }
    
    @media (prefers-color-scheme: dark) {
      #root, #__next {
        background-color: #1a1a1a;
      }
    }
    
    /* Chess.com style scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #f6f6f6;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #cccccc;
      border-radius: 4px;
      transition: background 0.2s ease;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #7fa650;
    }
    
    @media (prefers-color-scheme: dark) {
      ::-webkit-scrollbar-track {
        background: #2d2d2d;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #666666;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #7fa650;
      }
    }
    
    /* Button hover effects */
    button, [role="button"] {
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      outline: none;
      user-select: none;
    }
    
    button:hover, [role="button"]:hover {
      transform: translateY(-1px);
    }
    
    button:active, [role="button"]:active {
      transform: translateY(0);
    }
    
    /* Input focus styles */
    input, textarea, select {
      transition: all 0.2s ease;
      outline: none;
    }
    
    input:focus, textarea:focus, select:focus {
      box-shadow: 0 0 0 2px rgba(127, 166, 80, 0.2);
      border-color: #7fa650 !important;
    }
    
    /* Link styles */
    a {
      color: #7fa650;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    a:hover {
      color: #739148;
      text-decoration: underline;
    }
    
    /* Card hover effects */
    .chess-card {
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .chess-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    @media (prefers-color-scheme: dark) {
      .chess-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
    }
    
    /* Loading animations */
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .chess-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    .chess-spin {
      animation: spin 1s linear infinite;
    }
    
    .chess-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    
    /* Responsive typography */
    @media (max-width: 768px) {
      html {
        font-size: 14px;
      }
    }
    
    @media (min-width: 769px) {
      html {
        font-size: 16px;
      }
    }
    
    /* Chess board specific styles */
    .chess-board {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
    
    .chess-square {
      transition: all 0.2s ease;
    }
    
    .chess-square:hover {
      box-shadow: inset 0 0 0 2px rgba(127, 166, 80, 0.6);
    }
    
    .chess-square.highlighted {
      box-shadow: inset 0 0 0 3px #7fa650;
    }
    
    .chess-square.possible-move {
      box-shadow: inset 0 0 0 2px rgba(127, 166, 80, 0.4);
    }
    
    /* Modal and overlay styles */
    .chess-modal-overlay {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      transition: all 0.3s ease;
    }
    
    .chess-modal {
      animation: fadeIn 0.3s ease-out;
    }
    
    /* Toast notifications */
    .chess-toast {
      animation: fadeIn 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid #7fa650;
    }
    
    .chess-toast.success {
      border-left-color: #7fa650;
    }
    
    .chess-toast.error {
      border-left-color: #dc3545;
    }
    
    .chess-toast.warning {
      border-left-color: #f7b500;
    }
    
    .chess-toast.info {
      border-left-color: #17a2b8;
    }
    
    /* Selection styles */
    ::selection {
      background-color: rgba(127, 166, 80, 0.2);
    }
    
    ::-moz-selection {
      background-color: rgba(127, 166, 80, 0.2);
    }
    
    /* Focus visible for accessibility */
    *:focus-visible {
      outline: 2px solid #7fa650;
      outline-offset: 2px;
    }
    
    /* Print styles */
    @media print {
      * {
        background: white !important;
        color: black !important;
        box-shadow: none !important;
      }
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      button, [role="button"] {
        border: 2px solid currentColor;
      }
      
      .chess-card {
        border: 2px solid currentColor;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    /* Touch device optimizations */
    @media (hover: none) and (pointer: coarse) {
      button, [role="button"] {
        min-height: 44px;
        min-width: 44px;
      }
      
      .chess-square {
        min-height: 40px;
        min-width: 40px;
      }
    }
  `;
  
  document.head.appendChild(style);
};

// Call this function when the app loads on web
if (Platform.OS === 'web') {
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectGlobalWebStyles);
    } else {
      injectGlobalWebStyles();
    }
  }
}