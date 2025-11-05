
import React, { useState, useEffect } from 'react';
import Generator from './components/Generator';
import ChatBot from './components/ChatBot';
import { MagicWandIcon, MessageSquareIcon, SunIcon, MoonIcon } from './components/Icons';

type Tab = 'generator' | 'chat';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('generator');
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'generator':
                return <Generator />;
            case 'chat':
                return <ChatBot />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-pink-500 ${
                activeTab === tabName
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans flex flex-col transition-colors duration-300">
            <header className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        Robo AI - Coloring Book Creator
                    </h1>
                    <div className="flex items-center space-x-4">
                        <nav className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <TabButton tabName="generator" label="Coloring Book" icon={<MagicWandIcon />} />
                            <TabButton tabName="chat" label="Chat Bot" icon={<MessageSquareIcon />} />
                        </nav>
                         <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 md:p-8">
                {renderTabContent()}
            </main>

            <footer className="text-center p-4 text-xs text-gray-500 dark:text-gray-500">
                Powered by Google Gemini.
            </footer>
        </div>
    );
};

export default App;
