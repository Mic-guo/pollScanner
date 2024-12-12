import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from "./home";
import Camera from "./camera";
import Review from "./review";
import Guidelines from './guidelines';

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Review: {
    pollTapeData: any;
    onSave?: (updatedData: any) => void;
  };
  Guidelines: undefined;
};


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootLayout() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Camera" component={Camera} />
        <Stack.Screen name="Review" component={Review} />
        <Stack.Screen name="Guidelines" component={Guidelines} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
