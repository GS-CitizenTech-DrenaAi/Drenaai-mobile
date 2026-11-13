import { Tabs } from 'expo-router/js-tabs';
import { House, Map } from 'lucide-react-native';
import { BotaoDenunciar } from '@/ui/BotaoDenunciar';
import { IconeAba } from '@/ui/IconeAba';
import { cores } from '@/ui/tema';

export default function LayoutAbas() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSec,
        tabBarLabelStyle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
        tabBarStyle: { borderTopColor: cores.borda, paddingTop: 6, minHeight: 64 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bairro',
          tabBarAccessibilityLabel: 'Bairro',
          tabBarIcon: ({ focused }) => <IconeAba icone={House} focado={focused} />,
        }}
      />
      <Tabs.Screen
        name="denunciar"
        options={{
          title: 'Denunciar',
          tabBarButton: (props) => <BotaoDenunciar onPress={props.onPress} />,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarAccessibilityLabel: 'Mapa',
          tabBarIcon: ({ focused }) => <IconeAba icone={Map} focado={focused} />,
        }}
      />
    </Tabs>
  );
}