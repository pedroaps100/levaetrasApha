import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface Column {
  header: string;
  dataKey: string;
}

export const exportToPDF = (columns: Column[], data: any[], title: string, fileName: string) => {
  const doc = new jsPDF();
  
  const tableData = data.map(row => 
    columns.map(col => {
      const value = col.dataKey.split('.').reduce((o, i) => (o ? o[i] : ''), row);
      if (value instanceof Date) {
        return format(value, 'dd/MM/yyyy');
      }
      return value !== undefined && value !== null ? value.toString() : '';
    })
  );

  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 20);

  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: tableData,
    startY: 25,
  });

  doc.save(`${fileName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
  XLSX.writeFile(workbook, `${fileName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
