import { useEffect, useState } from 'react';
import {
  getBrandedModelDataUrl,
  getCachedBrandedModelDataUrl,
} from '../utils/garmentTexture';

export function useBrandedModelUrl(photoUrl?: string): string {
  const [resolvedUrl, setResolvedUrl] = useState<string>(() => {
    if (!photoUrl) return '';
    return getCachedBrandedModelDataUrl(photoUrl) || photoUrl;
  });

  useEffect(() => {
    if (!photoUrl) {
      setResolvedUrl('');
      return;
    }

    const cached = getCachedBrandedModelDataUrl(photoUrl);
    if (cached) {
      setResolvedUrl(cached);
      return;
    }

    let cancelled = false;
    setResolvedUrl(photoUrl);
    getBrandedModelDataUrl(photoUrl)
      .then((brandedUrl) => {
        if (!cancelled) setResolvedUrl(brandedUrl);
      })
      .catch(() => {
        // Fallback smoothly to original model photo
      });

    return () => {
      cancelled = true;
    };
  }, [photoUrl]);

  return resolvedUrl;
}
