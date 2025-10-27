import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPassword from "../screens/Auth/ForgotPassword";
import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";

const Stack = createNativeStackNavigator();

export default function AuthNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
}
