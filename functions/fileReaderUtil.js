/**
 * FileReader Utility - Convert files to Base64 data URLs
 */

/**
 * Convert a File object to a Base64 data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Promise resolving to data URL (e.g., "data:image/png;base64,...")
 * @throws {Error} - If FileReader fails or no file provided
 * @example
 * const file = inputElement.files[0];
 * const dataUrl = await fileToDataUrl(file);
 * const img = new Image();
 * img.src = dataUrl;
 */

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error(`FileReader failed for file: ${file.name}`));
    };
    
    reader.readAsDataURL(file);
  });
}
