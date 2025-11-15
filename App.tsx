
import React, { useState, useEffect } from 'react';
import Generator from './components/Generator';
import ChatBot from './components/ChatBot';
import Modal from './components/Modal';
import { MagicWandIcon, MessageSquareIcon, SunIcon, MoonIcon, HelpCircleIcon } from './components/Icons';

type Tab = 'generator' | 'chat';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('generator');
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
                    <div className="flex items-center space-x-2">
                        <nav className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <TabButton tabName="generator" label="Coloring Book" icon={<MagicWandIcon />} />
                            <TabButton tabName="chat" label="Chat Bot" icon={<MessageSquareIcon />} />
                        </nav>
                         <button
                            onClick={() => setIsHelpModalOpen(true)}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            aria-label="Help"
                        >
                            <HelpCircleIcon />
                        </button>
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

            <Modal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)}>
                <div className="p-6 max-w-lg text-gray-800 dark:text-gray-200">
                    <h2 id="modal-title" className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                        <HelpCircleIcon /> How to Use This App
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                                <MagicWandIcon /> Coloring Book Creator
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                                <li><strong>Enter a Theme:</strong> Type any creative idea into the 'Theme' box (e.g., "Jungle Animals on Vacation"). You can also pick from the presets!</li>
                                <li><strong>Add a Name:</strong> Put a child's name on the cover page.</li>
                                <li><strong>Choose Page Count:</strong> Select how many coloring pages you want (1-10).</li>
                                <li><strong>Generate:</strong> Click the "Generate My Coloring Book" button and watch the AI create your pages.</li>
                                <li><strong>Download:</strong> Once finished, you can download the complete book as a PDF or save individual images by hovering over them.</li>
                            </ol>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                                <MessageSquareIcon /> Chat Bot
                            </h3>
                             <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                                <li><strong>Switch Tabs:</strong> Click on the "Chat Bot" tab at the top.</li>
                                <li><strong>Ask Anything:</strong> Type a question into the box at the bottom and press Enter or the send button.</li>
                                <li><strong>Get Ideas:</strong> Use the bot to brainstorm coloring book themes or ask fun questions!</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default App;
