"use client";

import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
};

export function ZoomableImage({ src, alt }: Props) {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.5}
      maxScale={4}
      centerOnInit
      wheel={{ step: 0.12 }}
      doubleClick={{ mode: "reset" }}
    >
      <TransformComponent
        wrapperClass="!w-full !h-full flex items-center justify-center"
        contentClass="!w-full !h-full flex items-center justify-center"
      >
        <div className="relative h-[min(70vh,520px)] w-[min(50vw,360px)]">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}
