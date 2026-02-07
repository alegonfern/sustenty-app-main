import React, { useState, useEffect } from 'react';

export default function AnimatedWords({ words, interval = 1800, typingSpeed = 60, pause = 900 }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    if (!words || words.length === 0) return;
    let timeout;
    if (typing) {
      if (displayed.length < words[index].length) {
        timeout = setTimeout(() => {
          setDisplayed(words[index].slice(0, displayed.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => setTyping(false), pause);
      }
    } else {
      timeout = setTimeout(() => {
        setDisplayed('');
        setTyping(true);
        setIndex(i => (i + 1) % words.length);
      }, interval);
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, index, words, interval, typingSpeed, pause]);

  if (!words || words.length === 0) return null;
  return <span>{displayed}<span className="typewriter-cursor">|</span></span>;
}