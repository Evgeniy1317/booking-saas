'use client';

import { useEffect, useState } from 'react';
import MetallicPaint, { parseLogoImage } from '@/components/MetallicPaint';

interface MetallicIconProps {
  letter: string;
  size?: number;
  className?: string;
}

export default function MetallicIcon({
  letter,
  size = 40,
  className = ''
}: MetallicIconProps) {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Создаем canvas с буквой
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Устанавливаем размер canvas - минимум 500x500 для parseLogoImage
    const padding = 100;
    canvas.width = 500;
    canvas.height = 500;

    // Настраиваем контекст для текста - важно: белый фон, черный текст
    ctx.fillStyle = '#FFFFFF'; // Белый фон
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#000000'; // Черный текст
    ctx.font = `bold ${size * 10}px DM Sans, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Рисуем букву
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);

    // Преобразуем canvas в Blob
    canvas.toBlob((blob) => {
      if (!blob) return;

      // Создаем File из Blob
      const file = new File([blob], 'icon.png', { type: 'image/png' });

      // Используем parseLogoImage для получения ImageData
      parseLogoImage(file)
        .then(({ imageData }) => {
          setImageData(imageData);
          setImageDimensions({ width: imageData.width, height: imageData.height });
        })
        .catch((error) => {
          console.error('Error parsing icon:', error);
        });
    }, 'image/png');
  }, [letter, size]);

  // Показываем обычную иконку, если эффект не загрузился
  if (!imageData || imageDimensions.width === 0) {
    return (
      <div 
        className={`rounded-xl flex items-center justify-center ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <span className="text-accent-foreground font-bold font-display text-xl">
          {letter}
        </span>
      </div>
    );
  }

  // Показываем эффект
  return (
    <div 
      className={`rounded-xl overflow-hidden relative ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        position: 'relative',
        zIndex: 100
      }}
    >
      {/* Fallback - скрыт */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          opacity: 0,
          pointerEvents: 'none'
        }}
      >
        <span className="text-accent-foreground font-bold font-display text-xl">
          {letter}
        </span>
      </div>
      {/* MetallicPaint эффект */}
      <div 
        className="absolute inset-0"
        style={{ 
          width: `${size}px`,
          height: `${size}px`,
          transform: `scale(${size / imageDimensions.width}, ${size / imageDimensions.height})`,
          transformOrigin: 'top left',
          zIndex: 100
        }}
      >
        <div style={{ 
          width: `${imageDimensions.width}px`,
          height: `${imageDimensions.height}px`,
          position: 'relative'
        }}>
          <MetallicPaint imageData={imageData} />
        </div>
      </div>
    </div>
  );
}

