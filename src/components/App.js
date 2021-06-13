import React, {
    useEffect,
} from 'react';

function App() {
    useEffect(() => {
        console.log(electron);
    }, []);

    return (
        <div>Chat</div>
    );
}

export default App;