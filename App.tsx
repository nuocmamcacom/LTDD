import React from "react";
import { ThemeWrapper } from "./app/components/ThemeWrapper";
import MainNavigation from "./app/navigation/MainNavigation";
import { ApiProvider } from "./app/providers/ApiProvider";
import { LanguageProvider } from "./app/providers/LanguageProvider";
import { ChessThemeProvider } from "./constants/ChessThemeProvider";
import "./constants/globalWebStyles";

export default function App() {
  return (
    <ChessThemeProvider>
      <LanguageProvider>
        <ApiProvider>
          <ThemeWrapper>
            <MainNavigation />
          </ThemeWrapper>
        </ApiProvider>
      </LanguageProvider>
    </ChessThemeProvider>
  );
}
