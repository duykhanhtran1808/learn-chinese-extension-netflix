import React, { useEffect, useState, useRef } from 'react';
import { SubtitleData } from './types';
import { parseWebVTT } from './helper';
import pinyin from "pinyin";

export const SubtitleContainer: React.FC = () => {
    const [subtitles, setSubtitles] = useState<SubtitleData | null>(null);
    const [currentText, setCurrentText] = useState<string>('');
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Fetch and parse subtitles
    const fetchSubtitles = async (url: string) => {
        try {
            const response = await fetch(url);
            const text = await response.text();
            const entries = parseWebVTT(text);
            console.log(entries)
            setSubtitles({ url, entries });
        } catch (error) {
            console.error('Error fetching subtitles:', error);
        }
    };
    // Setup video time update listener
    const setupVideoListener = () => {
        if (!videoRef.current) {
            return;
        }

        const handleTimeUpdate = () => {
            if (!videoRef.current) {
                console.error('Video reference lost');
                return;
            }

            if (!subtitles?.entries) {
                return;
            }

            const currentTime = videoRef.current.currentTime * 1000; // convert to ms

            const currentSubtitle = subtitles.entries.find(
                entry => currentTime >= entry.start && currentTime <= entry.end
            );

            if (currentSubtitle) {
                setCurrentText(currentSubtitle.text);
            } else {
                setCurrentText('');
            }
        };

        videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
        // Trigger initial check
        handleTimeUpdate();
    };

    // Find and attach to video element
    useEffect(() => {
        const findVideo = () => {
            const watchVideoDiv = document.querySelector('.watch-video');
            if (watchVideoDiv) {
                const video = watchVideoDiv.querySelector('video');
                if (video) {
                    videoRef.current = video;
                    setVideoElement(video);
                    return true;
                }
            }
            return false;
        };

        // Try to find video element every 500ms until found
        const interval = setInterval(() => {
            if (findVideo()) {
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    // Load subtitles when URL is available
    useEffect(() => {
        chrome.storage.local.get(['subtitleData'], (result) => {
            if (result.subtitleData?.url) {
                fetchSubtitles(result.subtitleData.url);
            }
        });

        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.subtitleData?.newValue?.url) {
                fetchSubtitles(changes.subtitleData.newValue.url);
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, []);

    useEffect(() => {
        if (subtitles && videoElement) {
            // Initial setup is complete, now set up video listener
            setupVideoListener();
        }
    }, [subtitles, videoElement]);

    const [explanation, setExplanation] = useState<string | null>(null);
    const [isPendingExplain, setIsPendingExplain] = useState<boolean>(false);
    const explain = async () => {
        if (!currentText) return;
        setIsPendingExplain(true)
        const API_KEY = ""; // Hello World
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const requestBody = {
            contents: [
                {
                    parts: [{ text: `Explain this Chinese text's vocabulary and grammar in Vietnamese: ${currentText}. Make it short, about 3 sentences.` }],
                },
            ],
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            // Extracting the response text
            const generatedText =
                data?.candidates?.[0]?.content?.parts?.[0]?.text || "No explanation found";

            setExplanation(generatedText);
            setIsPendingExplain(false)

        } catch (error) {
            console.error("Error fetching explanation:", error);
            setExplanation("Failed to get an explanation.");
        }
    };
    return (
        <div className='netflix-subtitle-container'>
            <div className="current-subtitle">
                {currentText
                    ? currentText.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                            <p className='chinese-text'>
                                {line}
                            </p>
                            <p className='netflix-pinyin'>
                                {pinyin(line).map((word, index) => <span key={"pinyin" + index}>{word + " "}</span>)}
                            </p>
                        </React.Fragment>
                    ))
                    : 'No subtitle at this time'}
            </div>
            <div className='grammar-explain'>
                <button disabled={isPendingExplain} onClick={() => explain()}>{isPendingExplain ? "Wait..." : "Explain"}</button>
                <div className='grammar-ai-text'>{explanation}</div>
            </div>
        </div>
    );
};