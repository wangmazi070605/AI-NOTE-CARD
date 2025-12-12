declare module 'dom-to-image-more' {
  interface Options {
    quality?: number;
    width?: number;
    height?: number;
    style?: {
      [key: string]: string;
    };
    filter?: (node: Node) => boolean;
    bgcolor?: string;
    imagePlaceholder?: string;
    cacheBust?: boolean;
  }

  export function toPng(node: HTMLElement, options?: Options): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
  export function toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
  export function toPixelData(node: HTMLElement, options?: Options): Promise<ImageData>;
  export function toSvg(node: HTMLElement, options?: Options): Promise<string>;
}

