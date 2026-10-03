const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const textData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const qrDataUrl = await QRCode.toDataURL(textData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#4c0c56',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('[qrService] QR Generation Error:', error.message);
    throw error;
  }
};

module.exports = {
  generateQRCode,
};
