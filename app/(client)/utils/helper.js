export const generateRandomSKU = () => {
    let length = 5; // Set desired length
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sku = '';
    
    for (let i = 0; i < length; i++) {
        let randomIndex = Math.floor(Math.random() * chars.length);
        sku += chars[randomIndex];
    }
    
    return sku.toUpperCase();
  };