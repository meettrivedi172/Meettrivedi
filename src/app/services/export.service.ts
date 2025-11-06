import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  
  /**
   * Export data to CSV file
   */
  exportToCSV(data: any[], columns: string[], filename?: string): void {
    if (!data || data.length === 0) {
      return;
    }

    const headers = columns.join(',');
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col];
        // Handle special characters: quotes, commas, newlines
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        // If contains comma, quote, or newline, wrap in quotes and escape quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    
    // Add BOM for UTF-8 to ensure Excel opens it correctly
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || this.generateFilename('csv'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export data to Excel (XLSX) file
   * Note: This creates a simple XML-based Excel file. For advanced features, use a library like xlsx.
   */
  exportToExcel(data: any[], columns: string[], filename?: string): void {
    if (!data || data.length === 0) {
      return;
    }

    // Generate Excel XML format
    const xmlContent = this.generateExcelXML(data, columns);
    const blob = new Blob([xmlContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || this.generateFilename('xlsx'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy data to clipboard as tab-delimited text (pasteable to Excel)
   */
  async copyToClipboard(data: any[], columns: string[]): Promise<boolean> {
    if (!data || data.length === 0) {
      return false;
    }

    try {
      const headers = columns.join('\t');
      const rows = data.map(row => {
        return columns.map(col => {
          const value = row[col];
          return value === null || value === undefined ? '' : String(value);
        }).join('\t');
      });

      const textContent = [headers, ...rows].join('\n');
      
      await navigator.clipboard.writeText(textContent);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Generate filename with timestamp
   */
  private generateFilename(extension: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `QueryResults_${year}${month}${day}_${hours}${minutes}${seconds}.${extension}`;
  }

  /**
   * Generate Excel XML content
   */
  private generateExcelXML(data: any[], columns: string[]): string {
    let xml = '<?xml version="1.0"?>';
    xml += '<?mso-application progid="Excel.Sheet"?>';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"';
    xml += ' xmlns:o="urn:schemas-microsoft-com:office:office"';
    xml += ' xmlns:x="urn:schemas-microsoft-com:office:excel"';
    xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"';
    xml += ' xmlns:html="http://www.w3.org/TR/REC-html40">';
    xml += '<Worksheet ss:Name="Sheet1">';
    xml += '<Table>';

    // Headers row
    xml += '<Row>';
    columns.forEach(col => {
      xml += `<Cell><Data ss:Type="String"><![CDATA[${col}]]></Data></Cell>`;
    });
    xml += '</Row>';

    // Data rows
    data.forEach(row => {
      xml += '<Row>';
      columns.forEach(col => {
        const value = row[col];
        const type = this.getExcelType(value);
        xml += `<Cell><Data ss:Type="${type}"><![CDATA[${value === null || value === undefined ? '' : String(value)}]]></Data></Cell>`;
      });
      xml += '</Row>';
    });

    xml += '</Table>';
    xml += '</Worksheet>';
    xml += '</Workbook>';

    return xml;
  }

  /**
   * Determine Excel cell type based on value
   */
  private getExcelType(value: any): string {
    if (value === null || value === undefined) {
      return 'String';
    }
    if (typeof value === 'number') {
      return 'Number';
    }
    if (value instanceof Date) {
      return 'DateTime';
    }
    return 'String';
  }
}

