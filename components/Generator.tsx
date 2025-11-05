import React, { useState, useEffect } from 'react';
import { generateColoringBookAssets } from '../services/geminiService';
import { DownloadIcon, LoaderIcon, MagicWandIcon, HistoryIcon, LoadIcon, TrashIcon, ChevronDownIcon } from './Icons';
import Modal from './Modal';

// @ts-ignore
const { jsPDF } = window.jspdf;

interface Creation {
    id: string;
    theme: string;
    name: string;
    pageCount: number;
}

const themePresets = [
    "Black Inventors & Their Creations",
    "HBCU Homecoming Celebration",
    "Juneteenth Freedom Day",
    "Harlem Renaissance Jazz Club",
    "Civil Rights Heroes",
    "African Kings and Queens",
    "Black Christmas Joy",
    "Kwanzaa Principles",
    "Soul Food Feast",
    "The Great Migration Journey",
    "Tuskegee Airmen in Flight",
    "Buffalo Soldiers on the Frontier",
    "Divine Nine Greek Life",
    "Afrofuturism in Space",
    "Black Hair Magic",
    "Historic Black Wall Street",
    "Gullah Geechee Culture",
    "Sunday Morning Gospel",
    "Hip Hop Pioneers",
    "Black Cowboys & Cowgirls"
];

const Generator: React.FC = () => {
    const [theme, setTheme] = useState<string>('Space Dinosaurs');
    const [name, setName] = useState<string>('Alex');
    const [pageCount, setPageCount] = useState<number>(5);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [generatedAssets, setGeneratedAssets] = useState<{ coverImage: string, pages: string[] } | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [savedCreations, setSavedCreations] = useState<Creation[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);


    useEffect(() => {
        try {
            const storedCreations = localStorage.getItem('coloringBookCreations');
            if (storedCreations) {
                setSavedCreations(JSON.parse(storedCreations));
            }
        } catch (error) {
            console.error("Failed to parse saved creations from localStorage", error);
            localStorage.removeItem('coloringBookCreations');
        }
    }, []);

    const handleGenerate = async () => {
        if (!theme || !name || pageCount < 1) {
            setError('Please provide a theme, a name, and at least one page.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedAssets(null);
        setPdfUrl(null);
        setLoadingMessage('Warming up the magic crayons...');

        try {
            const assets = await generateColoringBookAssets(theme, name, pageCount, (message) => {
                setLoadingMessage(message);
            });
            setGeneratedAssets(assets);

            setLoadingMessage('Assembling your coloring book PDF...');
            createPdf(assets.coverImage, assets.pages, theme, name);
            
            const newCreation: Creation = {
                id: new Date().toISOString(),
                theme,
                name,
                pageCount
            };
            const isDuplicate = savedCreations.some(c => c.theme === theme && c.name === name && c.pageCount === pageCount);
            if (!isDuplicate) {
                const updatedCreations = [newCreation, ...savedCreations].slice(0, 10); // Keep most recent 10
                setSavedCreations(updatedCreations);
                localStorage.setItem('coloringBookCreations', JSON.stringify(updatedCreations));
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Oh no! Something went wrong. ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const createPdf = (coverImage: string, pages: string[], theme: string, name: string) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const imageWidth = pageWidth - margin * 2;
        const imageHeight = (imageWidth / 4) * 3; // 4:3 aspect ratio
        const v_offset = (pageHeight - imageHeight) / 2;

        const addImageToPage = (imageData: string) => {
             pdf.addImage(`data:image/jpeg;base64,${imageData}`, 'JPEG', margin, v_offset, imageWidth, imageHeight);
        }

        // Add cover page
        addImageToPage(coverImage);
        
        // Add content pages
        pages.forEach((pageData, index) => {
            pdf.addPage();
            addImageToPage(pageData);
        });

        const pdfBlob = pdf.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
    };

    const handleLoadCreation = (creation: Creation) => {
        setTheme(creation.theme);
        setName(creation.name);
        setPageCount(creation.pageCount);
    };

    const handleDeleteCreation = (idToDelete: string) => {
        const updatedCreations = savedCreations.filter(c => c.id !== idToDelete);
        setSavedCreations(updatedCreations);
        localStorage.setItem('coloringBookCreations', JSON.stringify(updatedCreations));
    };

    const handleDownloadImage = (imageData: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${imageData}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value) {
            setTheme(e.target.value);
        }
    };

    const handleImageClick = (imageData: string) => {
        setSelectedImage(imageData);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Create a Coloring Book</h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Enter a theme and a name, and let Gemini's magic create a unique coloring book for you!</p>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label htmlFor="theme-preset" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Presets (Optional)</label>
                         <select
                            id="theme-preset"
                            onChange={handlePresetChange}
                            defaultValue=""
                            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md p-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                        >
                            <option value="">-- Select a preset --</option>
                            {themePresets.map(preset => (
                                <option key={preset} value={preset}>{preset}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                            <input
                                id="theme"
                                type="text"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                placeholder="e.g., Magical Forest Animals"
                                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md p-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Child's Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Lily"
                                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md p-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            />
                        </div>
                         <div className="md:col-span-1">
                            <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pages</label>
                            <input
                                id="pageCount"
                                type="number"
                                value={pageCount}
                                onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
                                min="1"
                                max="10"
                                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md p-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <LoaderIcon /> : <MagicWandIcon />}
                    {isLoading ? loadingMessage : 'Generate My Coloring Book'}
                </button>

                {error && <p className="text-red-500 dark:text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {savedCreations.length > 0 && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                        className="w-full flex items-center justify-between text-gray-700 dark:text-gray-300 rounded-lg p-2 -m-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        aria-expanded={isHistoryVisible}
                        aria-controls="previous-creations-list"
                    >
                        <div className="flex items-center gap-2">
                            <HistoryIcon />
                            <h3 className="text-xl font-bold">Previous Creations</h3>
                        </div>
                        <ChevronDownIcon className={`transition-transform duration-300 ${isHistoryVisible ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div
                        id="previous-creations-list"
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${isHistoryVisible ? 'max-h-60 mt-4' : 'max-h-0'}`}
                    >
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {savedCreations.map((creation) => (
                                <div
                                    key={creation.id}
                                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg transition-all duration-200 hover:shadow-md"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={creation.theme}>{creation.theme}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            For {creation.name} ({creation.pageCount} pages)
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                        <button
                                            onClick={() => handleLoadCreation(creation)}
                                            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            aria-label="Load creation"
                                            title="Load"
                                        >
                                            <LoadIcon />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCreation(creation.id)}
                                            className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            aria-label="Delete creation"
                                            title="Delete"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {generatedAssets && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold mb-4 text-center">Your Creation is Ready!</h3>
                    
                    {pdfUrl && (
                        <div className="text-center mb-6">
                            <a
                                href={pdfUrl}
                                download={`${name.toLowerCase()}-${theme.toLowerCase().replace(/\s+/g, '-')}-coloring-book.pdf`}
                                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-transform transform hover:scale-105"
                            >
                                <DownloadIcon />
                                Download PDF
                            </a>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="relative group col-span-2 md:col-span-3 text-center p-2 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                            <p className="font-semibold text-lg">Cover Page</p>
                            <div
                                className="mt-2 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105"
                                onClick={() => handleImageClick(generatedAssets.coverImage)}
                                role="button"
                                tabIndex={0}
                                aria-label="View larger image of cover page"
                                onKeyDown={(e) => e.key === 'Enter' && handleImageClick(generatedAssets.coverImage)}
                            >
                                <img src={`data:image/jpeg;base64,${generatedAssets.coverImage}`} alt="Cover Page" className="w-full object-contain" />
                            </div>
                             <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadImage(generatedAssets.coverImage, `${name.toLowerCase()}-${theme.toLowerCase().replace(/\s+/g, '-')}-cover.jpeg`)
                                }}
                                className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                                aria-label="Download cover image"
                                title="Download Image"
                            >
                                <DownloadIcon />
                            </button>
                        </div>
                        {generatedAssets.pages.map((page, index) => (
                            <div key={index} className="relative group text-center p-2 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                                <p className="font-semibold">Page {index + 1}</p>
                                <div
                                    className="mt-2 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105"
                                    onClick={() => handleImageClick(page)}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`View larger image of page ${index + 1}`}
                                    onKeyDown={(e) => e.key === 'Enter' && handleImageClick(page)}
                                >
                                    <img src={`data:image/jpeg;base64,${page}`} alt={`Coloring page ${index + 1}`} className="w-full object-contain" />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadImage(page, `${name.toLowerCase()}-${theme.toLowerCase().replace(/\s+/g, '-')}-page-${index + 1}.jpeg`)
                                    }}
                                    className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                                    aria-label={`Download page ${index + 1}`}
                                    title="Download Image"
                                >
                                    <DownloadIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal isOpen={!!selectedImage} onClose={handleCloseModal}>
                {selectedImage && (
                    <img src={`data:image/jpeg;base64,${selectedImage}`} alt="Zoomed view" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain" />
                )}
            </Modal>
        </div>
    );
};

export default Generator;
