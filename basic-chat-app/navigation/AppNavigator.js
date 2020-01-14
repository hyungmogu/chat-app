import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

const MainAppNavigation = createStackNavigator({
    Login: {screen: LoginScreen},
    SignUp: {screen: SignUpScreen}
},
{
    initialRouteName: 'Login',
    defaultNavigationOptions: {
    headerShown: false
    }
});

const AppNavigator = createAppContainer(MainAppNavigation);

export default AppNavigator;