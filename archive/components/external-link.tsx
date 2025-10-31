import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { TouchableOpacity } from 'react-native';

type Props = {
  href: string;
  children?: React.ReactNode;
  target?: string;
};

export function ExternalLink({ href, children, target = '_blank' }: Props) {
  // On web, use the router Link so client-side navigation is preserved.
  if (process.env.EXPO_OS === 'web') {
    return (
      <Link href={href as any}>
        {children}
      </Link>
    );
  }

  // On native, open the link in the in-app browser when pressed.
  return (
    <TouchableOpacity
      onPress={async () => {
        await WebBrowser.openBrowserAsync(href, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC });
      }}>
      {children}
    </TouchableOpacity>
  );
}
