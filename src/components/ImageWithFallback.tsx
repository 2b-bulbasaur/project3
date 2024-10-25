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