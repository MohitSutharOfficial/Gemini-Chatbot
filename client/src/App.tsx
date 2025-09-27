import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SimpleLayout from './components/Layout/SimpleLayout';
import ChatPage from './components/Chat/ChatPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<SimpleLayout />}>
                <Route index element={<ChatPage />} />
                <Route path="*" element={<ChatPage />} />
            </Route>
        </Routes>
    );
}

export default App;