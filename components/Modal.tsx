import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="relative bg-white dark:bg-gray-900 p-2 rounded-lg shadow-xl m-4 animate-scaleIn"
                onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking on content
            >
                <button
                    onClick={onClose}
                    className="absolute -top-5 -right-5 z-10 p-2 bg-gray-800 text-white rounded-full hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition"
                    aria-label="Close"
                >
                    <CloseIcon />
                </button>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
