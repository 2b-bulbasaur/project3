'use client'

import Image from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  loading?: "lazy" | "eager";
  className?: string;
}

/**
 * Image component with fallback image functionality.
 * 
 * This component wraps the Next.js `Image` component and adds functionality
 * to handle cases where the original image source fails to load. If an error occurs,
 * it falls back to a default image.
 * 
 * @param {ImageWithFallbackProps} props - The props for the image component.
 * @returns {JSX.Element} A Next.js `Image` component with fallback support.
 */
const ImageWithFallback = (props: ImageWithFallbackProps) => {
  const { src, alt, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc('/fallback-food-image.jpg'); // Make sure this image exists in your public folder
      }}
    />
  );
};

export default ImageWithFallback;