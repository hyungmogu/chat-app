import React, { Component } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    View,
    ScrollView,
    Platform
} from 'react-native';

import { SafeAreaConsumer } from 'react-native-safe-area-context';

import { ChatConsumer, APIConsumer } from '../components/Context';
import AppButton from '../components/AppButton';
import AppTextArea from '../components/AppTextArea';
import ChatBoxList from '../components/ChatBoxList';
import Config from '../Config';


class ChatScreen extends Component {

    chatService = this.props.chatContext.actions;
    apiService = this.props.apiContext.actions;

    timeout = 3000;

    state = {
        messages: [],
        scrollOnInit: false
    };

    textRef = React.createRef();
    scrollViewRef = React.createRef();

    async componentDidMount() {
        await this.handleGetChatBoxes(
            this.props.navigation.getParam('chatUser')
        );

        this.props.navigation.setParams({
            chatter: this.props.chatContext.user,
            chattee: this.props.navigation.getParam('chatUser')
        });

        this.connectWebSocket();
    }

    connectWebSocket() {
        let chattee = this.props.navigation.getParam('chatUser');
        this.webSocket = new WebSocket(`${Config.hostWs}/ws/api/v1/chats/${chattee.pk}/`);

        this.webSocket.onopen = () => {
            console.warn('connected')
        }

        this.webSocket.onmessage = (res) => {
            let data = JSON.parse(res.data);
            this.setState(prevState => {
                return {
                    messages: [...prevState.messages, data]
                }
            });
        };

        this.webSocket.onclose = () => {
            console.warn('disconnected. Attempting to reconnect in 3 seconds...');
            setTimeout(this.reconnectWebSocket, this.timeout);
        }

        this.webSocket.onerror = (err) => {
            console.warn (err);
        }
    }

    reconnectWebSocket = () => {
        if (!this.webSocket || this.webSocket.readyState == WebSocket.CLOSED) {
            this.connectWebSocket();
        }
    }


    handleGetChatBoxes = (chattee) => {
        this.apiService.get(`${Config.host}/api/v1/chats/${chattee.pk}`).then(res => {
            console.log('In handleGetChatboxes');
            this.setState({
                messages: res.data,
            });
        }).catch(err => {
            console.warn(err);
        })
    }

    handleToggleDateTime = (messages, index) => {
        if (messages[index].showDateTime === undefined) {
            messages[index].showDateTime = false;
        }

        messages[index].showDateTime = messages[index].showDateTime ? false : true;

        this.setState({messages});
    }

    handleMeasureInputHeight = (event) => {
        if (this.state.inputHeight) {
            return;
        }

        this.setState({
            inputHeight: event.nativeEvent.layout.height
        })
    }

    handleSubmit = (text) => {
        let data = JSON.stringify({
            text: text
        });

        this.setState({
            scrollOnInit: false
        })

        this.webSocket.send(data);
        this.textRef.current.clear();
    }

    scrollToBottom = () => {
        if (this.state.messages.length > 0 && !this.state.scrollOnInit) {
            this.scrollViewRef.current.scrollToEnd({animated: false});
            this.setState({
                scrollOnInit: true
            })
        }
    }

    componentWillUnmount() {
        this.webSocket.onclose = () => {};
        this.webSocket.close();
    }

    render() {
        return (
            <SafeAreaConsumer>
                { insets =>
                    <SafeAreaView style={styles.safeViewContainer}>
                        <KeyboardAvoidingView
                            style={styles.container}
                            keyboardVerticalOffset={
                                this.state.inputHeight + (Platform.OS === 'ios' ? insets.bottom : 10)
                            }
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            enabled
                        >
                            <ScrollView
                                style={styles.chatContainer}
                                ref={this.scrollViewRef}
                                onContentSizeChange={() => this.scrollToBottom()}
                            >
                                <ChatBoxList
                                    messages={this.state.messages}
                                    toggleDateTime={this.handleToggleDateTime}
                                />
                            </ScrollView>
                            <View
                                style={styles.inputContainer}
                                onLayout={(event) => {this.handleMeasureInputHeight(event)}}
                            >
                                <AppTextArea
                                    placeholder={'Message'}
                                    ref={this.textRef}
                                    style={{flex: 1, marginRight: 10}}
                                />
                                <AppButton
                                    type={'secondary'}
                                    onPress={() => this.handleSubmit(
                                        this.textRef.current._lastNativeText
                                    )}>
                                        Submit
                                </AppButton>
                            </View>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                }
            </SafeAreaConsumer>
        );
    }
}

const styles = StyleSheet.create({
    safeViewContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    chatContainer: {
        flex: 1,
        padding: 10
    },
    inputContainer: {
        borderTopWidth: 1,
        borderTopColor: '#EAEAEA',
        flexDirection: 'row',
        padding: 10
    }
});


export default React.forwardRef((props, ref) => (
    <ChatConsumer>
        { chatContext =>
            <APIConsumer>
                { apiContext =>
                    <ChatScreen
                        {...props}
                        chatContext={chatContext}
                        apiContext={apiContext}
                        ref={ref}
                    />
                }
            </APIConsumer>
        }
    </ChatConsumer>
));
