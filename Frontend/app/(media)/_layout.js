import { Stack } from 'expo-router';

export default function MediaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="MediaHome" options={{ headerShown: false }} />
      <Stack.Screen name="CaseMap" options={{ headerShown: false }} />
      <Stack.Screen name="Analytics" options={{ headerShown: false }} />
      <Stack.Screen name="ExportReports" options={{ headerShown: false }} />
    </Stack>
  );
}

