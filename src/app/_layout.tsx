import {Stack} from "expo-router";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <Stack screenOptions = {{headerBackButtonDisplayMode: "minimal"}} >
      <Stack.Screen name ="(tabs)" options= {{headerShown: false}} />
    </Stack>
  );
}
