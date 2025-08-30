import React, { useState, useEffect, useRef } from 'react';
import { 
    Mic, MicOff, Volume2, VolumeX, Play, Square, 
    RefreshCw, HelpCircle, Settings, CheckCircle, XCircle,
    AlertTriangle, Info, Command
} from 'lucide-react';
import { 
    VoiceCommand, 
    VoiceUpdateResult, 
    VoiceCommandPattern,
    voiceMenuUpdateService 
} from '../services/voiceMenuUpdateService';

interface VoiceMenuUpdatesProps {
    onVoiceUpdate?: (result: VoiceUpdateResult) => void;
}

const VoiceMenuUpdates: React.FC<VoiceMenuUpdatesProps> = ({ onVoiceUpdate }) => {
    const [isListening, setIsListening] = useState(false);
    const [lastCommand, setLastCommand] = useState<string>('');
    const [lastResult, setLastResult] = useState<VoiceUpdateResult | null>(null);
    const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
    const [showHelp, setShowHelp] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [testMode, setTestMode] = useState(false);
    const [testCommand, setTestCommand] = useState('');

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        setIsSupported(voiceMenuUpdateService.isSupported());
    }, []);

    const startListening = async () => {
        if (!isSupported) {
            alert('Voice recognition is not supported in this browser. Try using Chrome or Edge.');
            return;
        }

        try {
            const success = await voiceMenuUpdateService.startListening((result) => {
                handleVoiceResult(result);
            });

            if (success) {
                setIsListening(true);
                playAudioFeedback('start');
                addCommandToHistory({
                    command: 'Listening started...',
                    confidence: 1,
                    timestamp: new Date()
                });
            } else {
                alert('Failed to start voice recognition. Please check your microphone permissions.');
            }
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            alert('Error starting voice recognition. Please try again.');
        }
    };

    const stopListening = () => {
        voiceMenuUpdateService.stopListening();
        setIsListening(false);
        playAudioFeedback('stop');
        addCommandToHistory({
            command: 'Listening stopped',
            confidence: 1,
            timestamp: new Date()
        });
    };

    const handleVoiceResult = (result: VoiceUpdateResult) => {
        setLastResult(result);
        if (onVoiceUpdate) {
            onVoiceUpdate(result);
        }

        // Add to command history
        if (lastCommand) {
            addCommandToHistory({
                command: lastCommand,
                confidence: 0.9,
                timestamp: new Date()
            });
        }

        // Play success/error sound
        if (result.success) {
            playAudioFeedback('success');
        } else {
            playAudioFeedback('error');
        }
    };

    const addCommandToHistory = (command: VoiceCommand) => {
        setCommandHistory(prev => [command, ...prev.slice(0, 9)]); // Keep last 10 commands
    };

    const playAudioFeedback = (type: 'start' | 'stop' | 'success' | 'error') => {
        // This would play actual audio feedback
        // For now, we'll just log it
        console.log(`Playing ${type} audio feedback`);
    };

    const testVoiceCommand = async () => {
        if (!testCommand.trim()) return;

        setTestMode(true);
        try {
            const result = await voiceMenuUpdateService.simulateVoiceInput(testCommand);
            handleVoiceResult(result);
            setTestCommand('');
        } catch (error) {
            console.error('Test command failed:', error);
        } finally {
            setTestMode(false);
        }
    };

    const getResultIcon = (result: VoiceUpdateResult) => {
        switch (result.action) {
            case 'created': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'updated': return <CheckCircle className="w-5 h-5 text-blue-600" />;
            case 'deleted': return <CheckCircle className="w-5 h-5 text-orange-600" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Info className="w-5 h-5 text-gray-600" />;
        }
    };

    const getResultColor = (result: VoiceUpdateResult) => {
        switch (result.action) {
            case 'created': return 'border-green-200 bg-green-50';
            case 'updated': return 'border-blue-200 bg-blue-50';
            case 'deleted': return 'border-orange-200 bg-orange-50';
            case 'error': return 'border-red-200 bg-red-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    const getAvailableCommands = () => {
        return voiceMenuUpdateService.getAvailableCommands();
    };

    if (!isSupported) {
        return (
            <div className="bg-white rounded-lg border p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Recognition Not Supported</h3>
                <p className="text-gray-600 mb-4">
                    Your browser doesn't support voice recognition. Please use Chrome, Edge, or Safari for voice features.
                </p>
                <div className="text-sm text-gray-500">
                    <p>Supported browsers:</p>
                    <ul className="mt-2 space-y-1">
                        <li>• Google Chrome (recommended)</li>
                        <li>• Microsoft Edge</li>
                        <li>• Safari (iOS 14.3+)</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">🎤 Voice Menu Updates</h2>
                    <p className="text-gray-600">Update your menu using voice commands</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Voice Commands Help"
                    >
                        <HelpCircle className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Voice Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Voice Control Panel */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                        <button
                            onClick={isListening ? stopListening : startListening}
                            disabled={testMode}
                            className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 ${
                                isListening 
                                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                                    : 'bg-blue-500 hover:bg-blue-600'
                            } ${testMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                        </button>
                        
                        {isListening && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <div className="text-lg font-medium text-gray-900 mb-2">
                        {isListening ? 'Listening...' : 'Click to Start Voice Recognition'}
                    </div>
                    <div className="text-sm text-gray-600">
                        {isListening 
                            ? 'Speak your command clearly into your microphone' 
                            : 'Make sure your microphone is connected and permissions are granted'
                        }
                    </div>
                </div>

                {/* Test Mode */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Test Voice Commands</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={testCommand}
                            onChange={(e) => setTestCommand(e.target.value)}
                            placeholder="Type a voice command to test..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={testVoiceCommand}
                            disabled={!testCommand.trim() || testMode}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {testMode ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Last Result */}
            {lastResult && (
                <div className={`border rounded-lg p-4 ${getResultColor(lastResult)}`}>
                    <div className="flex items-start gap-3">
                        {getResultIcon(lastResult)}
                        <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">
                                {lastResult.success ? 'Command Executed Successfully' : 'Command Failed'}
                            </div>
                            <div className="text-gray-700">{lastResult.message}</div>
                            {lastResult.action !== 'error' && (
                                <div className="text-sm text-gray-600 mt-2">
                                    Action: {lastResult.action}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Command History */}
            {commandHistory.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Commands</h3>
                    <div className="space-y-3">
                        {commandHistory.map((command, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Command className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-900">{command.command}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {command.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Help Panel */}
            {showHelp && (
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Commands Help</h3>
                    <div className="grid gap-4">
                        {getAvailableCommands().map((pattern, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                                <div className="font-medium text-gray-900 mb-2">{pattern.pattern}</div>
                                <div className="text-sm text-gray-600 mb-3">{pattern.description}</div>
                                <div className="text-sm text-gray-700">
                                    <div className="font-medium mb-1">Examples:</div>
                                    <ul className="space-y-1">
                                        {pattern.examples.map((example, exIndex) => (
                                            <li key={exIndex} className="text-gray-600">• "{example}"</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900">Voice Recognition Language</div>
                                <div className="text-sm text-gray-600">Currently set to English (US)</div>
                            </div>
                            <select className="px-3 py-2 border border-gray-300 rounded-md">
                                <option value="en-US">English (US)</option>
                                <option value="en-GB">English (UK)</option>
                                <option value="es-ES">Spanish</option>
                                <option value="fr-FR">French</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900">Confidence Threshold</div>
                                <div className="text-sm text-gray-600">Minimum confidence level for command execution</div>
                            </div>
                            <select className="px-3 py-2 border border-gray-300 rounded-md">
                                <option value="0.6">60% (Low)</option>
                                <option value="0.7" selected>70% (Medium)</option>
                                <option value="0.8">80% (High)</option>
                                <option value="0.9">90% (Very High)</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900">Audio Feedback</div>
                                <div className="text-sm text-gray-600">Play sounds for voice recognition events</div>
                            </div>
                            <label className="flex items-center">
                                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="ml-2 text-sm text-gray-700">Enable</span>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900">Auto-Start</div>
                                <div className="text-sm text-gray-600">Automatically start listening when page loads</div>
                            </div>
                            <label className="flex items-center">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="ml-2 text-sm text-gray-700">Enable</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-900 mb-2">Voice Command Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Speak clearly and at a normal pace</li>
                            <li>• Use the exact command patterns shown in the help section</li>
                            <li>• Ensure your microphone is working and permissions are granted</li>
                            <li>• Test commands first using the test mode</li>
                            <li>• Commands are case-insensitive and flexible with wording</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceMenuUpdates;
