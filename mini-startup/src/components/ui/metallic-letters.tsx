'use client';

import MetallicIcon from './metallic-icon';

interface MetallicLettersProps {
  text: string;
  className?: string;
  iconSize?: number;
}

export default function MetallicLetters({
  text,
  className = '',
  iconSize = 40
}: MetallicLettersProps) {
  // Разбиваем текст на буквы и пробелы
  const letters = text.split('');

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {letters.map((letter, index) => {
        // Если это пробел, возвращаем пробел
        if (letter === ' ') {
          return <span key={index} className="inline-block" style={{ width: `${iconSize * 0.3}px` }} />;
        }
        
        // Применяем MetallicIcon к каждой букве
        return (
          <MetallicIcon 
            key={index} 
            letter={letter} 
            size={iconSize}
            className="inline-block"
          />
        );
      })}
    </span>
  );
}

