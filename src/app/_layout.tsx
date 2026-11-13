import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SessaoProvider, useSessao } from '@/estado/SessaoContext';

SplashScreen.preventAutoHideAsync();

function Rotas() {
  const { usuario } = useSessao();
  const logado = usuario !== null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!logado}>
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
      </Stack.Protected>
      <Stack.Protected guard={logado}>
        <Stack.Screen name="(abas)" />
                <Stack.Screen name="ocorrencia/[id]" />
        <Stack.Screen name="perfil" options={{ presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontesCarregadas] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    if (fontesCarregadas) SplashScreen.hideAsync();
  }, [fontesCarregadas]);

  if (!fontesCarregadas) return null;

  return (
    <SessaoProvider>
      <Rotas />
    </SessaoProvider>
  );
}