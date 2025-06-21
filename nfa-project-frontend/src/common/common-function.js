import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
export const countWords = (text) => {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0;
};

 export const formatDate = (isoDate) =>
  isoDate ? new Date(isoDate).toISOString().split("T")[0] : "";

 export function generatePDF({
  element,
  filename = 'document',
  isType = 'DOWNLOAD', // 'PRINT' or 'DOWNLOAD'
  customPage = false,
}) {
  html2canvas(element, {
    scale: 3,
    onclone: (document, clonedElement) => {
      const receiptStampBox = clonedElement.querySelector('.receiptStampBox');
      if (receiptStampBox) {
        receiptStampBox.classList.remove('d-none');
      }
    },
  }).then((canvas) => {
    const imageGeneratedFromTemplate = canvas.toDataURL('image/png');
    const fileWidth = 200;
    const generatedImageHeight = (canvas.height * fileWidth) / canvas.width;

    const pageSize = customPage ? [fileWidth + 20, generatedImageHeight] : 'a4';
    const PDF = new jsPDF('p', 'mm', pageSize);

    PDF.addImage(
      imageGeneratedFromTemplate,
      'PNG',
      5,
      5,
      fileWidth,
      generatedImageHeight,
      '',
      'MEDIUM'
    );

    PDF.rect(
      5,
      5,
      PDF.internal.pageSize.width - 10,
      PDF.internal.pageSize.height - 10,
      'S'
    );

    if (isType === 'DOWNLOAD') {
      PDF.save(`${filename}.pdf`);
    } else if (isType === 'PRINT') {
      PDF.autoPrint();
      window.open(PDF.output('bloburl'), '_blank');
    }
  });
}