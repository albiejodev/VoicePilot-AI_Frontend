export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onloadend = () => {
        const result = reader.result as string;
  
        resolve(result);
      };
  
      reader.onerror = reject;
  
      reader.readAsDataURL(blob);
    });
  };
  