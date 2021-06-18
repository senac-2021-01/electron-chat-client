import React, {
    useEffect,
} from 'react';

import { MESSAGE_TYPE } from '../constants';

function App() {
    const handleOnMessage = message => {
        switch (message.Type) {
            case MESSAGE_TYPE.LOGIN_SUCCESS:
                console.log('ClientNumber: ', message.ClientNumber);
                console.log('Name: ', message.Name);

                //this.Login.ShowChat(message.GetInt32("ClientNumber"), message.GetString("Name"));
                break;
            case MESSAGE_TYPE.LOGIN_FAIL:
                console.log('Text: ', message.Text);

                //this.Login.EnableBtnLogin(message.GetString("Text"));
                break;
            case MESSAGE_TYPE.NEW_USER_SUCCESS:
                console.log('ClientNumber: ', message.ClientNumber);
                console.log('Text: ', message.Text);

                //this.Register.ShowChat(message.GetInt32("ClientNumber"), message.GetString("Text"));
                break;
            case MESSAGE_TYPE.NEW_USER_FAIL:
                console.log('Text: ', message.Text);

                //this.Register.EnableBtnRegister(message.GetString("Text"));
                break;
            case MESSAGE_TYPE.NEW_TEXT:
                console.log('UserName: ', message.UserName);
                console.log('Text: ', message.Text);

                //this.Chat.AppendMessage($"{message.GetString("UserName")}: {message.GetString("Text")}");
                break;
            default: //TODO: tratar
                console.log('Message:', message);
                break;
        }
    };

    useEffect(() => {
        electron.setOnMessage(handleOnMessage);
        electron.sendMessage({
            Type: MESSAGE_TYPE.LOGIN,
            login: 'ededededed',
            password: 'node123',
        });
    }, []);

    return (
        <div>Chat</div>
    );
}

export default App;