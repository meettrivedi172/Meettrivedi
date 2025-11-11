import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetadataService, AppObject, Field, FieldDataType } from '../services/metadata.service';

interface TreeNode {
  id: string;
  name: string;
  displayName: string;
  type: 'object' | 'field';
  icon: string;
  dataType?: string;
  isExpanded: boolean;
  isPrimaryKey?: boolean;
  isRequired?: boolean;
  isLookup?: boolean;
  lookupTarget?: string;
  children?: TreeNode[];
  fieldData?: Field;
}

@Component({
  selector: 'app-database-schema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './database-schema.component.html',
  styleUrl: './database-schema.component.css'
})
export class DatabaseSchemaComponent implements OnInit {
  @Output() fieldDragStart = new EventEmitter<{ tableName: string; fieldName: string; qualifiedName: string }>();
  @Output() tableDragStart = new EventEmitter<{ tableName: string; tableDisplayName: string }>();
  
  searchTerm: string = '';
  treeNodes: TreeNode[] = [];
  isLoading: boolean = false;

  constructor(private metadataService: MetadataService) {}

  ngOnInit(): void {
    this.loadSchema();
  }

  loadSchema(): void {
    this.isLoading = true;
    this.metadataService.getSchema().subscribe({
      next: (schema) => {
        this.treeNodes = this.buildTreeNodes(schema.appObjects);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading schema:', error);
        this.isLoading = false;
      }
    });
  }

  buildTreeNodes(appObjects: AppObject[]): TreeNode[] {
    return appObjects.map(appObject => ({
      id: appObject.id,
      name: appObject.name,
      displayName: appObject.displayName,
      type: 'object' as const,
      icon: '📊',
      isExpanded: false,
      children: appObject.fields.map(field => ({
        id: field.id,
        name: field.name,
        displayName: field.displayName,
        type: 'field' as const,
        icon: this.getFieldIcon(field.dataType, field.isPrimaryKey, field.isLookup),
        dataType: this.getDataTypeName(field.dataType),
        isExpanded: false,
        isPrimaryKey: field.isPrimaryKey,
        isRequired: field.isRequired,
        isLookup: field.isLookup,
        lookupTarget: field.isLookup ? `${field.lookupDetails?.targetObjectName}.${field.lookupDetails?.targetDisplayField}` : undefined,
        fieldData: field
      }))
    }));
  }

  getFieldIcon(dataType: FieldDataType, isPrimaryKey: boolean, isLookup: boolean): string {
    if (isPrimaryKey) return '🔑';
    if (isLookup) return '🔗';
    
    switch (dataType) {
      case FieldDataType.String:
      case FieldDataType.Text:
        return '📝';
      case FieldDataType.Number:
      case FieldDataType.Decimal:
        return '#️⃣';
      case FieldDataType.DateTime:
      case FieldDataType.TimeStamp:
        return '📅';
      case FieldDataType.Boolean:
        return '✓';
      default:
        return '📋';
    }
  }

  getDataTypeName(dataType: FieldDataType): string {
    const typeMap: { [key: number]: string } = {
      [FieldDataType.Number]: 'Int',
      [FieldDataType.Boolean]: 'Boolean',
      [FieldDataType.Decimal]: 'Decimal',
      [FieldDataType.DateTime]: 'Date',
      [FieldDataType.TimeStamp]: 'Timestamp',
      [FieldDataType.String]: 'String',
      [FieldDataType.Text]: 'String',
      [FieldDataType.Lookup]: 'Lookup'
    };
    return typeMap[dataType] || 'Unknown';
  }

  toggleNode(node: TreeNode): void {
    if (node.type === 'object') {
      node.isExpanded = !node.isExpanded;
    }
  }

  searchSchema(): void {
    if (!this.searchTerm.trim()) {
      this.loadSchema();
      return;
    }

    this.isLoading = true;
    this.metadataService.searchSchema(this.searchTerm).subscribe({
      next: (schema) => {
        this.treeNodes = this.buildTreeNodes(schema.appObjects);
        // Keep all nodes collapsed - user must click to expand
        this.treeNodes.forEach(node => {
          node.isExpanded = false;
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching schema:', error);
        this.isLoading = false;
      }
    });
  }

  matchesSearch(node: TreeNode): boolean {
    const term = this.searchTerm.toLowerCase();
    return node.name.toLowerCase().includes(term) || 
           node.displayName.toLowerCase().includes(term);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadSchema();
  }

  onTableDragStart(event: DragEvent, table: TreeNode): void {
    if (!event.dataTransfer) return;
    
    // Emit to parent component
    this.tableDragStart.emit({
      tableName: table.name,
      tableDisplayName: table.displayName
    });
    
    // Set drag data - use table name with prefix to distinguish from fields
    event.dataTransfer.setData('text/plain', `TABLE:${table.name}`);
    event.dataTransfer.effectAllowed = 'copy';
    
    // Visual feedback
    if (event.target) {
      (event.target as HTMLElement).style.opacity = '0.5';
    }
  }

  onTableDragEnd(event: DragEvent): void {
    if (event.target) {
      (event.target as HTMLElement).style.opacity = '1';
    }
  }

  onFieldDragStart(event: DragEvent, field: TreeNode): void {
    if (!event.dataTransfer || !field.fieldData) return;
    
    const parentNode = this.findParentNode(field.id);
    const qualifiedName = parentNode 
      ? this.metadataService.getQualifiedFieldName(parentNode.name, field.name)
      : field.name;
    
    // Emit to parent component
    this.fieldDragStart.emit({
      tableName: parentNode?.name || '',
      fieldName: field.name,
      qualifiedName
    });
    
    // Set drag data
    event.dataTransfer.setData('text/plain', qualifiedName);
    event.dataTransfer.effectAllowed = 'copy';
    
    // Visual feedback
    if (event.target) {
      (event.target as HTMLElement).style.opacity = '0.5';
    }
  }

  onFieldDragEnd(event: DragEvent): void {
    if (event.target) {
      (event.target as HTMLElement).style.opacity = '1';
    }
  }

  findParentNode(fieldId: string): TreeNode | undefined {
    for (const node of this.treeNodes) {
      if (node.children?.some(child => child.id === fieldId)) {
        return node;
      }
    }
    return undefined;
  }

  getFieldTooltip(field: TreeNode): string {
    if (!field.fieldData) return '';
    
    const parts = [
      `Type: ${field.dataType}`,
      field.isPrimaryKey ? 'Primary Key' : null,
      field.isRequired ? 'Required' : 'Optional',
      field.isLookup && field.lookupTarget ? `→ ${field.lookupTarget}` : null
    ].filter(Boolean);
    
    return parts.join(' • ');
  }
}
