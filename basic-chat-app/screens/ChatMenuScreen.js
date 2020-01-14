import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';

import Logo from '../components/Logo';
import AppButton from '../components/AppButton';

export default class LoginScreen extends Component {
    render() {
        const {navigate} = this.props.navigation;
        return (
            <SafeAreaView style={styles.safeViewContainer}>
                <View style={styles.container}>

                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    safeViewContainer: {
        flex: 1,
        backgroundColor: 'white'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: Dimensions.get('window').height / 6,
        alignItems: 'center'
    },
    input: {
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: '#E2E2E2',
        borderColor: '#E2E2E2',
        padding: 15,
        width: 350,
        marginBottom: 5
    },
    inputContainer: {
        marginBottom: 15
    }
});