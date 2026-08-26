import React, { useState, useEffect } from 'react';

// Keep track of which messages have already been typed
const typedMessageIds = new Set<string>();

interface TypewriterTextProps {
  text: string;
  id: string; // unique id combining messageId + section (e.g. msg123-assessment)
  speed?: number; // ms per char
  onComplete?: () => void;
  startDelay?: number;
  showCursor?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  id, 
  speed = 10, 
  onComplete, 
  startDelay = 0,
  showCursor = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(() => typedMessageIds.has(id));
  const [isWaiting, setIsWaiting] = useState(startDelay > 0 && !typedMessageIds.has(id));

  useEffect(() => {
    if (typedMessageIds.has(id)) {
      setDisplayedText(text);
      setIsDone(true);
      setIsWaiting(false);
      if (onComplete) onComplete();
      return;
    }

    let i = 0;
    setDisplayedText('');
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const startTyping = () => {
      setIsWaiting(false);
      intervalId = setInterval(() => {
        i++;
        setDisplayedText(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(intervalId);
          setIsDone(true);
          typedMessageIds.add(id);
          if (onComplete) onComplete();
        }
      }, speed);
    };

    if (startDelay > 0) {
      timeoutId = setTimeout(startTyping, startDelay);
    } else {
      startTyping();
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [text, id, speed, startDelay]);

  if (isWaiting) return null;

  return (
    <>
      {displayedText}
      {!isDone && showCursor && (
        <span className="inline-block w-[6px] h-3.5 ml-[2px] bg-green-500 animate-pulse align-middle" />
      )}
    </>
  );
};
