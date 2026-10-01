import QRCode from 'qrcode';

export type DocumentFields = {
  clientName: string;
  passport: string;
  reference: string;
  issueDate: string;
  documentName: string;
};

export type Coordinates = {
  name: { x: number; y: number };
  passport: { x: number; y: number };
  photo: { x: number; y: number };
};
export type TextStyle = { fontFamily: 'Arial' | 'Georgia'; fontSize: number; color: string };

export async function renderDocument(
  fields: DocumentFields,
  coordinates: Coordinates,
  background?: string,
  photo?: string,
  textStyle: TextStyle = { fontFamily: 'Arial', fontSize: 31, color: '#182d2a' },
) {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');

  ctx.fillStyle = '#f6f7f2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (background) {
    const image = new Image();
    image.src = background;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The selected template could not be loaded.'));
    });
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#173b38';
    ctx.fillRect(0, 0, canvas.width, 158);
    ctx.fillStyle = '#d9b56d';
    ctx.fillRect(0, 158, canvas.width, 8);
    ctx.fillStyle = '#fff';
    ctx.font = '600 25px Georgia';
    ctx.fillText('GLOBAL MIGRATION HUB', 112, 82);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#c8d8d2';
    ctx.fillText('DOCUMENT SERVICES  /  VERIFIED COPY', 112, 116);
    ctx.fillStyle = '#153b37';
    ctx.font = '600 38px Georgia';
    ctx.fillText(fields.documentName.toUpperCase(), 112, 258);
    ctx.strokeStyle = '#d8ddda';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(112, 286);
    ctx.lineTo(1488, 286);
    ctx.stroke();
    ctx.fillStyle = '#77837f';
    ctx.font = '16px Arial';
    ctx.fillText('HOLDER DETAILS', 112, 340);
  }

  ctx.fillStyle = textStyle.color;
  ctx.font = `600 ${textStyle.fontSize}px ${textStyle.fontFamily}`;
  ctx.fillText(fields.clientName || 'Client name', coordinates.name.x, coordinates.name.y);
  ctx.font = `${Math.round(textStyle.fontSize * 0.74)}px ${textStyle.fontFamily}`;
  ctx.fillText(fields.passport || 'Passport number', coordinates.passport.x, coordinates.passport.y);

  ctx.fillStyle = '#fff';
  ctx.fillRect(coordinates.photo.x, coordinates.photo.y, 170, 220);
  ctx.strokeStyle = '#a9b7b1';
  ctx.lineWidth = 2;
  ctx.strokeRect(coordinates.photo.x, coordinates.photo.y, 170, 220);
  if (photo) {
    const portrait = new Image();
    portrait.src = photo;
    await new Promise<void>((resolve, reject) => {
      portrait.onload = () => resolve();
      portrait.onerror = () => reject(new Error('The selected portrait could not be loaded.'));
    });
    ctx.drawImage(portrait, coordinates.photo.x + 4, coordinates.photo.y + 4, 162, 212);
  } else {
    ctx.fillStyle = '#77837f';
    ctx.font = '14px Arial';
    ctx.fillText('PHOTO', coordinates.photo.x + 58, coordinates.photo.y + 116);
  }

  ctx.fillStyle = '#61706c';
  ctx.font = '15px Arial';
  ctx.fillText('REFERENCE NUMBER', 112, 610);
  ctx.fillStyle = '#182d2a';
  ctx.font = '21px Arial';
  ctx.fillText(fields.reference, 112, 646);
  ctx.fillStyle = '#61706c';
  ctx.font = '15px Arial';
  ctx.fillText('ISSUE DATE', 112, 714);
  ctx.fillStyle = '#182d2a';
  ctx.font = '21px Arial';
  ctx.fillText(fields.issueDate, 112, 750);
  ctx.strokeStyle = '#d8ddda';
  ctx.beginPath();
  ctx.moveTo(112, 840);
  ctx.lineTo(1488, 840);
  ctx.stroke();
  ctx.fillStyle = '#74817d';
  ctx.font = '14px Arial';
  ctx.fillText('DEMO DOCUMENT  ·  Verify all details before use', 112, 884);

  const qr = await QRCode.toDataURL(`https://globalmigrationhub.example/verify/${encodeURIComponent(fields.reference)}`, {
    width: 160,
    margin: 1,
    color: { dark: '#173b38', light: '#ffffff' },
  });
  const qrImage = new Image();
  qrImage.src = qr;
  await new Promise<void>((resolve, reject) => {
    qrImage.onload = () => resolve();
    qrImage.onerror = () => reject(new Error('QR code generation failed.'));
  });
  ctx.fillStyle = '#fff';
  ctx.fillRect(1350, 676, 170, 170);
  ctx.drawImage(qrImage, 1355, 681, 160, 160);
  return canvas.toDataURL('image/png');
}