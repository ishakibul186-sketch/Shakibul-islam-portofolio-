import React, { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export default function SafeImage({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackTitle,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError || !src) {
    return (
      <div className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mb-3">
          <ImageIcon size={18} />
        </div>
        <p className="text-xs font-medium text-zinc-500 line-clamp-2 max-w-[220px]">
          {fallbackTitle || alt}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
}
