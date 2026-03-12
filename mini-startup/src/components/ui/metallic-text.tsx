'use client';

import { useEffect, useState, useRef } from 'react';
import MetallicPaint, { parseLogoImage } from '@/components/MetallicPaint';

interface MetallicTextProps {
  text: string;
  className?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
}

export default function MetallicText({
  text,
  className = '',
  fontSize = 32,
  fontFamily = 'DM Sans, sans-serif',
  fontWeight = 'bold'
}: MetallicTextProps) {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Измеряем текст для правильного размера
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    if (!measureCtx) return;

    measureCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = measureCtx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2;
    
    setDimensions({ width: textWidth, height: textHeight });

    // Создаем canvas с текстом - используем тот же подход, что и для иконки
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Устанавливаем размер canvas - минимум 1000x1000 для parseLogoImage (как для SVG)
    const padding = 200; // Большой padding чтобы текст не обрезался
    canvas.width = Math.max(1000, textWidth + padding * 2);
    canvas.height = Math.max(1000, textHeight + padding * 2);

    // Настраиваем контекст для текста - белый фон, черный текст
    ctx.fillStyle = '#FFFFFF'; // Белый фон
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#000000'; // Черный текст
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Рисуем текст по центру
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Преобразуем canvas в Blob
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob');
        return;
      }

      // Создаем File из Blob
      const file = new File([blob], 'text.png', { type: 'image/png' });

      // Используем parseLogoImage для получения ImageData
      parseLogoImage(file)
        .then(({ imageData }) => {
          console.log('ImageData loaded:', imageData.width, imageData.height);
          setImageData(imageData);
          setImageDimensions({ width: imageData.width, height: imageData.height });
        })
        .catch((error) => {
          console.error('Error parsing image:', error);
        });
    }, 'image/png');
  }, [text, fontSize, fontFamily, fontWeight]);

  // Всегда показываем обычный текст, эффект накладывается поверх
  return (
    <span 
      ref={containerRef}
      className="relative inline-block"
      style={{ 
        display: 'inline-block',
        position: 'relative'
      }}
    >
      {/* Обычный текст - скрыт когда эффект готов */}
      <span 
        ref={textRef}
        className={className} 
        style={{ 
          fontSize: `${fontSize}px`, 
          fontFamily, 
          fontWeight,
          display: 'inline-block',
          position: 'relative',
          zIndex: 1,
          color: 'inherit',
          opacity: imageData ? 0 : 1,
          pointerEvents: 'none'
        }}
      >
        {text}
      </span>
      {/* MetallicPaint эффект - поверх текста, только когда готов */}
      {imageData && dimensions.width > 0 && imageDimensions.width > 0 && (
        <span 
          className="absolute top-0 left-0"
          style={{ 
            width: `${dimensions.width}px`, 
            height: `${dimensions.height}px`,
            position: 'absolute',
            zIndex: 100,
            pointerEvents: 'none',
            overflow: 'hidden',
            // Масштабируем canvas под размер текста
            transform: `scale(${Math.min(dimensions.width / imageDimensions.width, dimensions.height / imageDimensions.height)})`,
            transformOrigin: 'top left'
          }}
        >
          <div style={{ 
            width: `${imageDimensions.width}px`,
            height: `${imageDimensions.height}px`,
            position: 'relative'
          }}>
            <MetallicPaint imageData={imageData} params={{ edge: 2, patternBlur: 0.005, patternScale: 2, refraction: 0.015, speed: 0.3, liquid: 0.07 }} />
          </div>
        </span>
      )}
    </span>
  );
}

