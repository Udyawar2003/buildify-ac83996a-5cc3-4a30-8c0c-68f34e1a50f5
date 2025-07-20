
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarWithAnimationProps {
  src?: string;
  fallback: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  isAnimating?: boolean;
  className?: string;
}

const AvatarWithAnimation: React.FC<AvatarWithAnimationProps> = ({
  src,
  fallback,
  alt = 'Avatar',
  size = 'md',
  isAnimating = false,
  className,
}) => {
  const [pulseOpacity, setPulseOpacity] = useState(0);

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setPulseOpacity((prev) => (prev === 0 ? 0.5 : 0));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setPulseOpacity(0);
    }
  }, [isAnimating]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)}>
        {src && <AvatarImage src={src} alt={alt} />}
        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          {fallback}
        </AvatarFallback>
      </Avatar>
      <div
        className="absolute inset-0 rounded-full bg-blue-500 transition-opacity duration-1000"
        style={{ opacity: pulseOpacity }}
      />
    </div>
  );
};

export default AvatarWithAnimation;