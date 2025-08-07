import { useEffect } from 'react';

const NotificationPopup = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`${bgColor} text-black px-6 py-4 rounded-lg shadow-lg flex items-center`}>
                <span className="mr-4">{message}</span>
                <button 
                    onClick={onClose}
                    className="ml-4 text-black hover:text-gray-200 focus:outline-none"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default NotificationPopup;