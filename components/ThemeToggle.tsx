import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
    const [theme, setTheme] = useState<Theme>('system');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }

        localStorage.setItem('theme', theme);
    }, [theme, mounted]);

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
    };

    if (!mounted) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ${className}`}>
            <button
                onClick={() => handleThemeChange('light')}
                className={`p-2 rounded-md transition-colors ${
                    theme === 'light'
                        ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                title="Light mode"
            >
                <Sun className="w-4 h-4" />
            </button>
            
            <button
                onClick={() => handleThemeChange('system')}
                className={`p-2 rounded-md transition-colors ${
                    theme === 'system'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                title="System preference"
            >
                <Monitor className="w-4 h-4" />
            </button>
            
            <button
                onClick={() => handleThemeChange('dark')}
                className={`p-2 rounded-md transition-colors ${
                    theme === 'dark'
                        ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                title="Dark mode"
            >
                <Moon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default ThemeToggle;
