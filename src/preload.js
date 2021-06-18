const {
    contextBridge,
} = require('electron');

const net = require('net');

const INT32_BYTES_LENGTH = 4;

const socket = {
    isConnected: false,
    socketClient: new net.Socket(),
    onMessage: null,
};

const writeInt32 = (socketClient, value) => {
    let buffer = Buffer.alloc(INT32_BYTES_LENGTH);

    buffer.writeInt32LE(parseInt(value), 0);

    socketClient.write(buffer);
};

const writeString = (socketClient, value) => {
    let stringBytesLength = Buffer.byteLength(value, 'utf8');

    writeInt32(socketClient, stringBytesLength);

    let buffer = Buffer.alloc(stringBytesLength);

    buffer.write(value, 'utf8');

    socketClient.write(buffer);
};

const writeMessage = (socketClient, message) => {
    let messageKeys = Object.keys(message);
    let messageValues = Object.values(message);

    writeInt32(socketClient, messageKeys.length);

    for (let i = 0; i < messageKeys.length; i++) {
        if (typeof messageValues[i] == 'number') {
            writeString(socketClient, 'Int32');
            writeString(socketClient, messageKeys[i]);
            writeInt32(socketClient, messageValues[i]);
        } else if (typeof messageValues[i] == 'string') {
            writeString(socketClient, 'String');
            writeString(socketClient, messageKeys[i]);
            writeString(socketClient, messageValues[i]);
        }
    }
};

const readString = (socketClient, position) => {
    let stringStart = position + INT32_BYTES_LENGTH;
    let stringEnd = stringStart + socketClient.readInt32LE(position);

    return {
        value: socketClient.toString('utf8', stringStart, stringEnd),
        nextPosition: stringEnd,
    };
};

const readMessage = socketData => {
    let result = {};

    let propertiesLength = socketData.readInt32LE(0);

    let dataStart = INT32_BYTES_LENGTH;

    for (let i = 0; i < propertiesLength; i++) {
        let newString = readString(socketData, dataStart);

        dataStart = newString.nextPosition;

        let propertyType = newString.value;

        ////////////////////////////////////////////////////////////////////////////

        newString = readString(socketData, dataStart);

        dataStart = newString.nextPosition;

        let propertyName = newString.value;

        ////////////////////////////////////////////////////////////////////////////

        switch (propertyType) {
            case 'Int32':
                result[propertyName] = socketData.readInt32LE(dataStart);

                dataStart += INT32_BYTES_LENGTH;
                break;
            case 'String':
                newString = readString(socketData, dataStart);

                dataStart = newString.nextPosition;

                result[propertyName] = newString.value;
                break;
            default: //TODO: tratar
                break;
        }
    }

    return result;
};

socket.socketClient.on('data', data => {
    let dataObject = readMessage(data);

    socket.onMessage && socket.onMessage(dataObject);
});

contextBridge.exposeInMainWorld('electron', {
    setOnMessage: onMessage => {
        socket.onMessage = onMessage;
    },
    sendMessage: message => {
        if (socket.isConnected) {
            writeMessage(socket.socketClient, message);
        } else {
            socket.socketClient.connect({
                host: '127.0.0.1',
                port: 5000,
            });

            socket.socketClient.on('connect', () => {
                socket.isConnected = true;

                writeMessage(socket.socketClient, message);
            });
        }
    },
});
