export function compressImage(file: File, maxWidth = 800, quality = 0.5): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = (h * maxWidth) / w;
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      let result = canvas.toDataURL('image/webp', quality);

      if (result.length > 500_000) {
        result = canvas.toDataURL('image/webp', 0.3);
      }

      if (result.length > 500_000) {
        const smallCanvas = document.createElement('canvas');
        const sw = Math.round(w * 0.6);
        const sh = Math.round(h * 0.6);
        smallCanvas.width = sw;
        smallCanvas.height = sh;
        smallCanvas.getContext('2d')!.drawImage(canvas, 0, 0, sw, sh);
        result = smallCanvas.toDataURL('image/webp', 0.3);
      }

      resolve(result);
    };
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}
