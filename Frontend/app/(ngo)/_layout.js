import { Stack } from 'expo-router';

export default function NGOLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NGOHome" options={{ headerShown: false }} />
      <Stack.Screen name="CaseMap" options={{ headerShown: false }} />
      <Stack.Screen name="Analytics" options={{ headerShown: false }} />
      <Stack.Screen name="ExportReports" options={{ headerShown: false }} />
    </Stack>
  );
}
