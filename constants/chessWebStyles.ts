/**
 * Chess.com Web Styles Implementation
 * Complete responsive CSS based on Chess.com design system
 */

export const chessWebStyles = `
/* Chess.com Global Styles */
:root {
  /* Chess.com Color Variables */
  --chess-primary: #7fa650;
  --chess-primary-hover: #739148;
  --chess-primary-light: #8fb961;
  
  --chess-bg-primary: #ffffff;
  --chess-bg-secondary: #f6f6f6;
  --chess-bg-tertiary: #eeeeee;
  
  --chess-text-primary: #2c2c2c;
  --chess-text-secondary: #666666;
  --chess-text-tertiary: #999999;
  
  --chess-border: #e0e0e0;
  --chess-border-light: #f0f0f0;
  
  --chess-board-light: #f0d9b5;
  --chess-board-dark: #b58863;
  
  --chess-shadow: rgba(0, 0, 0, 0.08);
  --chess-shadow-hover: rgba(0, 0, 0, 0.15);
  
  /* Spacing */
  --chess-space-xs: 4px;
  --chess-space-sm: 8px;
  --chess-space-md: 16px;
  --chess-space-lg: 24px;
  --chess-space-xl: 32px;
  
  /* Border Radius */
  --chess-radius-sm: 4px;
  --chess-radius-md: 8px;
  --chess-radius-lg: 12px;
  --chess-radius-xl: 16px;
}

/* Dark mode variables */
@media (prefers-color-scheme: dark) {
  :root {
    --chess-bg-primary: #1a1a1a;
    --chess-bg-secondary: #2d2d2d;
    --chess-bg-tertiary: #404040;
    
    --chess-text-primary: #ffffff;
    --chess-text-secondary: #cccccc;
    --chess-text-tertiary: #999999;
    
    --chess-border: #404040;
    --chess-border-light: #333333;
    
    --chess-shadow: rgba(0, 0, 0, 0.3);
    --chess-shadow-hover: rgba(0, 0, 0, 0.5);
  }
}

/* Base Styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
  background-color: var(--chess-bg-primary);
  color: var(--chess-text-primary);
  line-height: 1.5;
  margin: 0;
  padding: 0;
}

/* Chess.com Style Components */

/* Headers */
.chess-header {
  background-color: var(--chess-bg-primary);
  border-bottom: 1px solid var(--chess-border);
  padding: var(--chess-space-md);
  box-shadow: 0 1px 2px var(--chess-shadow);
}

.chess-header-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--chess-text-primary);
  margin: 0;
  text-align: center;
}

/* Cards */
.chess-card {
  background-color: var(--chess-bg-primary);
  border: 1px solid var(--chess-border);
  border-radius: var(--chess-radius-md);
  padding: var(--chess-space-md);
  margin: var(--chess-space-xs) 0;
  box-shadow: 0 1px 3px var(--chess-shadow);
  transition: all 0.2s ease;
}

.chess-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--chess-shadow-hover);
}

.chess-card-large {
  background-color: var(--chess-bg-primary);
  border: 1px solid var(--chess-border);
  border-radius: var(--chess-radius-lg);
  padding: var(--chess-space-lg);
  margin: var(--chess-space-md);
  box-shadow: 0 2px 8px var(--chess-shadow);
}

/* Buttons */
.chess-btn {
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  padding: var(--chess-space-md) var(--chess-space-lg);
  border-radius: var(--chess-radius-sm);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.chess-btn-primary {
  background-color: var(--chess-primary);
  color: white;
  box-shadow: 0 1px 3px var(--chess-shadow);
}

.chess-btn-primary:hover {
  background-color: var(--chess-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px var(--chess-shadow-hover);
}

.chess-btn-secondary {
  background-color: transparent;
  color: var(--chess-primary);
  border: 1px solid var(--chess-primary);
}

.chess-btn-secondary:hover {
  background-color: var(--chess-primary);
  color: white;
}

.chess-btn-outline {
  background-color: transparent;
  color: var(--chess-text-primary);
  border: 1px solid var(--chess-border);
}

.chess-btn-outline:hover {
  border-color: var(--chess-primary);
  color: var(--chess-primary);
}

/* Form Elements */
.chess-input {
  font-family: inherit;
  font-size: 16px;
  padding: var(--chess-space-sm) var(--chess-space-md);
  border: 1px solid var(--chess-border);
  border-radius: var(--chess-radius-sm);
  background-color: var(--chess-bg-secondary);
  color: var(--chess-text-primary);
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.chess-input:focus {
  outline: none;
  border-color: var(--chess-primary);
  background-color: var(--chess-bg-primary);
  box-shadow: 0 0 0 2px rgba(127, 166, 80, 0.2);
}

.chess-input::placeholder {
  color: var(--chess-text-tertiary);
}

/* Typography */
.chess-text-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--chess-text-primary);
  margin: 0 0 var(--chess-space-md) 0;
}

.chess-text-subtitle {
  font-size: 20px;
  font-weight: 600;
  color: var(--chess-text-secondary);
  margin: 0 0 var(--chess-space-sm) 0;
}

.chess-text-body {
  font-size: 16px;
  font-weight: 400;
  color: var(--chess-text-primary);
  line-height: 1.5;
}

.chess-text-secondary {
  color: var(--chess-text-secondary);
}

.chess-text-tertiary {
  color: var(--chess-text-tertiary);
  font-size: 14px;
}

.chess-text-link {
  color: var(--chess-primary);
  text-decoration: underline;
  cursor: pointer;
}

.chess-text-link:hover {
  color: var(--chess-primary-hover);
}

/* Badges */
.chess-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--chess-space-xs) var(--chess-space-sm);
  background-color: var(--chess-primary);
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: var(--chess-radius-xl);
  letter-spacing: 0.5px;
}

.chess-badge-success {
  background-color: #7fa650;
}

.chess-badge-warning {
  background-color: #f7b500;
}

.chess-badge-error {
  background-color: #dc3545;
}

.chess-badge-info {
  background-color: #17a2b8;
}

/* Chess Board */
.chess-board {
  aspect-ratio: 1;
  background-color: var(--chess-board-light);
  border: 2px solid var(--chess-border);
  border-radius: var(--chess-radius-sm);
  box-shadow: 0 2px 8px var(--chess-shadow);
  user-select: none;
}

.chess-square {
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.chess-square-light {
  background-color: var(--chess-board-light);
}

.chess-square-dark {
  background-color: var(--chess-board-dark);
}

.chess-square:hover {
  box-shadow: inset 0 0 0 2px rgba(127, 166, 80, 0.6);
}

.chess-square.highlighted {
  box-shadow: inset 0 0 0 3px var(--chess-primary);
}

/* Layout Utilities */
.chess-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--chess-space-md);
}

.chess-flex {
  display: flex;
}

.chess-flex-column {
  flex-direction: column;
}

.chess-flex-center {
  align-items: center;
  justify-content: center;
}

.chess-flex-between {
  justify-content: space-between;
}

.chess-flex-around {
  justify-content: space-around;
}

.chess-grid {
  display: grid;
  gap: var(--chess-space-md);
}

.chess-grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.chess-grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.chess-grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* Spacing Utilities */
.chess-m-xs { margin: var(--chess-space-xs); }
.chess-m-sm { margin: var(--chess-space-sm); }
.chess-m-md { margin: var(--chess-space-md); }
.chess-m-lg { margin: var(--chess-space-lg); }
.chess-m-xl { margin: var(--chess-space-xl); }

.chess-p-xs { padding: var(--chess-space-xs); }
.chess-p-sm { padding: var(--chess-space-sm); }
.chess-p-md { padding: var(--chess-space-md); }
.chess-p-lg { padding: var(--chess-space-lg); }
.chess-p-xl { padding: var(--chess-space-xl); }

.chess-mt-xs { margin-top: var(--chess-space-xs); }
.chess-mt-sm { margin-top: var(--chess-space-sm); }
.chess-mt-md { margin-top: var(--chess-space-md); }
.chess-mt-lg { margin-top: var(--chess-space-lg); }

.chess-mb-xs { margin-bottom: var(--chess-space-xs); }
.chess-mb-sm { margin-bottom: var(--chess-space-sm); }
.chess-mb-md { margin-bottom: var(--chess-space-md); }
.chess-mb-lg { margin-bottom: var(--chess-space-lg); }

/* Responsive Design */
@media (max-width: 768px) {
  .chess-container {
    padding: 0 var(--chess-space-sm);
  }
  
  .chess-header-title {
    font-size: 20px;
  }
  
  .chess-text-title {
    font-size: 24px;
  }
  
  .chess-grid-2,
  .chess-grid-3,
  .chess-grid-4 {
    grid-template-columns: 1fr;
  }
  
  .chess-card-large {
    margin: var(--chess-space-sm);
    padding: var(--chess-space-md);
  }
  
  .chess-btn {
    padding: var(--chess-space-sm) var(--chess-space-md);
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .chess-header {
    padding: var(--chess-space-sm);
  }
  
  .chess-card {
    padding: var(--chess-space-sm);
  }
  
  .chess-text-title {
    font-size: 20px;
  }
  
  .chess-text-subtitle {
    font-size: 18px;
  }
}

/* Animations */
@keyframes chess-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes chess-slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes chess-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.chess-fade-in {
  animation: chess-fade-in 0.3s ease-out;
}

.chess-slide-in {
  animation: chess-slide-in 0.3s ease-out;
}

.chess-pulse {
  animation: chess-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Loading States */
.chess-loading {
  opacity: 0.6;
  pointer-events: none;
}

.chess-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(127, 166, 80, 0.3);
  border-radius: 50%;
  border-top-color: var(--chess-primary);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.chess-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus styles */
.chess-btn:focus,
.chess-input:focus {
  outline: 2px solid var(--chess-primary);
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .chess-card,
  .chess-btn,
  .chess-input {
    border-width: 2px;
  }
}

/* Print styles */
@media print {
  .chess-card {
    break-inside: avoid;
  }
  
  .chess-btn {
    background: white !important;
    color: black !important;
    border: 1px solid black !important;
  }
}
`;

// Inject styles into document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = chessWebStyles;
  document.head.appendChild(styleElement);
}