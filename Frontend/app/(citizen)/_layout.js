import { Stack } from 'expo-router';

export default function CitizenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CitizenHome" options={{ headerShown: false }} />
      <Stack.Screen name="MyCases" options={{ headerShown: false }} />
      <Stack.Screen name="CaseDetail" options={{ headerShown: false }} />
      <Stack.Screen name="CaseEvidence" options={{ headerShown: false }} />
      <Stack.Screen name="CaseForm" options={{ headerShown: false }} />
      <Stack.Screen name="AddEvidence" options={{ headerShown: false }} />
      <Stack.Screen name="FindLawyer" options={{ headerShown: false }} />
      <Stack.Screen name="Profile" options={{ headerShown: false }} />
      <Stack.Screen name="RequestConsultation" options={{ headerShown: false }} />
    </Stack>
  );
}
