import { useState, useEffect } from 'react';

export function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, []);

    const styles = {
        success: 'bg-green-500/20 border-green-500/30 text-green-400',
        error: 'bg-red-500/20 border-red-500/30 text-red-400',
        info: 'bg-blue-500/20 border-blue-500/30 text-blue-400'
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50
                         px-4 py-3 rounded-lg border
                         text-sm font-medium
                         animate-fade-in shadow-lg
                         ${styles[type]}`}>
            {message}
        </div>
    );
}

export function useToast() {
    const [toast, setToast] = useState(null);

    function showToast(message, type = 'success') {
        setToast({ message, type });
    }

    function hideToast() {
        setToast(null);
    }

    return { toast, showToast, hideToast };
}