import { useEffect, RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  excludeRefs: RefObject<HTMLElement>[] = []
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside any of the excluded refs
      const isExcluded = excludeRefs.some(
        excludeRef => excludeRef.current?.contains(target)
      );
      
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(target) || isExcluded) {
        return;
      }
      
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, excludeRefs]);
} 