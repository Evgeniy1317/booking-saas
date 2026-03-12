'use client';

import { useEffect, useState, useRef } from 'react';
import MetallicPaint, { parseLogoImage } from '@/components/MetallicPaint';

interface MetallicBackgroundProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  className?: string;
  children: React.ReactNode;
}

export default function MetallicBackground({
  width = 1000,
  height = 500,
  borderRadius = 48,
  className = '',
  children
}: MetallicBackgroundProps) {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return;

    // Создаем canvas с формой блока (прямоугольник с закругленными углами)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Используем размер контейнера или минимальный размер
    const canvasWidth = Math.max(width, containerSize.width || 1000);
    const canvasHeight = Math.max(height, containerSize.height || 500);
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Белый фон
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Черный прямоугольник с закругленными углами
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    const r = borderRadius;
    ctx.moveTo(r, 0);
    ctx.lineTo(canvas.width - r, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
    ctx.lineTo(canvas.width, canvas.height - r);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
    ctx.lineTo(r, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();

    // Преобразуем canvas в Blob
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob');
        return;
      }

      // Создаем File из Blob
      const file = new File([blob], 'background.png', { type: 'image/png' });

      // Используем parseLogoImage для получения ImageData
      parseLogoImage(file)
        .then(({ imageData }) => {
          setImageData(imageData);
        })
        .catch((error) => {
          console.error('Error parsing background:', error);
        });
    }, 'image/png');
  }, [width, height, borderRadius, containerSize]);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ 
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* MetallicPaint эффект на фоне */}
      {imageData && containerRef.current && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            width: '100%',
            height: '100%',
            position: 'absolute',
            zIndex: 0,
            borderRadius: `${borderRadius}px`,
            overflow: 'hidden'
          }}
        >
          <div 
            style={{ 
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
          >
            <MetallicPaint imageData={imageData} />
          </div>
        </div>
      )}
      {/* Контент поверх эффекта */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

