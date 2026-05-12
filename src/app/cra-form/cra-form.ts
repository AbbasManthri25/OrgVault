import { Component, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Formio } from 'formiojs';

interface ComponentCategory {
  name: string;
  icon: string;
  components: ComponentItem[];
  expanded: boolean;
}

interface ComponentItem {
  label: string;
  type: string;
  icon: string;
  schema: any;
}

@Component({
  selector: 'app-cra-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cra-form.html',
  styleUrls: ['./cra-form.css']
})
export class CraForm implements AfterViewInit, OnDestroy {
  builderInstance: any = null;
  loading = true;
  error = '';
  searchQuery = signal('');
  expandedCategory = signal<string | null>('Basic');

  componentCategories: ComponentCategory[] = [
    {
      name: 'Basic',
      icon: '📦',
      expanded: true,
      components: [
        {
          label: 'Text Field',
          type: 'textfield',
          icon: '📝',
          schema: { type: 'textfield', key: 'textField', label: 'Text Field', placeholder: 'Enter text' }
        },
        {
          label: 'Text Area',
          type: 'textarea',
          icon: '📄',
          schema: { type: 'textarea', key: 'textarea', label: 'Text Area', placeholder: 'Enter text', rows: 4 }
        },
        {
          label: 'Number',
          type: 'number',
          icon: '#️⃣',
          schema: { type: 'number', key: 'number', label: 'Number', placeholder: 'Enter number' }
        },
        {
          label: 'Password',
          type: 'password',
          icon: '🔒',
          schema: { type: 'password', key: 'password', label: 'Password', placeholder: 'Enter password' }
        },
        {
          label: 'Checkbox',
          type: 'checkbox',
          icon: '☑️',
          schema: { type: 'checkbox', key: 'checkbox', label: 'Checkbox' }
        },
        {
          label: 'Select Boxes',
          type: 'selectboxes',
          icon: '📋',
          schema: {
            type: 'selectboxes',
            key: 'selectboxes',
            label: 'Select Boxes',
            values: [{ label: 'Option 1', value: 'opt1' }]
          }
        },
        {
          label: 'Select',
          type: 'select',
          icon: '🔽',
          schema: {
            type: 'select',
            key: 'select',
            label: 'Select',
            data: { values: [{ label: 'Option 1', value: 'opt1' }] }
          }
        },
        {
          label: 'Radio',
          type: 'radio',
          icon: '🔘',
          schema: {
            type: 'radio',
            key: 'radio',
            label: 'Radio',
            values: [{ label: 'Option 1', value: 'opt1' }]
          }
        },
        {
          label: 'Button',
          type: 'button',
          icon: '🔘',
          schema: { type: 'button', key: 'button', label: 'Click Me', action: 'submit' }
        }
      ]
    },
    {
      name: 'Advanced',
      icon: '⚙️',
      expanded: false,
      components: [
        {
          label: 'Email',
          type: 'email',
          icon: '✉️',
          schema: { type: 'email', key: 'email', label: 'Email', placeholder: 'Enter email' }
        },
        {
          label: 'Phone Number',
          type: 'phoneNumber',
          icon: '☎️',
          schema: { type: 'phoneNumber', key: 'phone', label: 'Phone Number', placeholder: 'Enter phone' }
        },
        {
          label: 'URL',
          type: 'url',
          icon: '🔗',
          schema: { type: 'url', key: 'url', label: 'URL', placeholder: 'Enter URL' }
        },
        {
          label: 'Date Time',
          type: 'datetime',
          icon: '📅',
          schema: { type: 'datetime', key: 'datetime', label: 'Date & Time' }
        },
        {
          label: 'File Upload',
          type: 'file',
          icon: '📎',
          schema: { type: 'file', key: 'file', label: 'File Upload' }
        }
      ]
    },
    {
      name: 'Layout',
      icon: '📐',
      expanded: false,
      components: [
        {
          label: 'Columns',
          type: 'columns',
          icon: '📊',
          schema: {
            type: 'columns',
            columns: [
              { width: 6, components: [] },
              { width: 6, components: [] }
            ]
          }
        },
        {
          label: 'Panel',
          type: 'panel',
          icon: '📦',
          schema: { type: 'panel', key: 'panel', label: 'Panel', components: [] }
        },
        {
          label: 'Tabs',
          type: 'tabs',
          icon: '📑',
          schema: { type: 'tabs', tabs: [{ label: 'Tab 1', components: [] }] }
        }
      ]
    },
    {
      name: 'Data',
      icon: '💾',
      expanded: false,
      components: [
        {
          label: 'Hidden Field',
          type: 'hidden',
          icon: '👁️‍🗨️',
          schema: { type: 'hidden', key: 'hidden', defaultValue: '' }
        },
        {
          label: 'Data Grid',
          type: 'datagrid',
          icon: '📈',
          schema: { type: 'datagrid', key: 'datagrid', label: 'Data Grid', components: [] }
        }
      ]
    },
    {
      name: 'Premium',
      icon: '👑',
      expanded: false,
      components: [
        {
          label: 'Signature Pad',
          type: 'signature',
          icon: '✍️',
          schema: { type: 'signature', key: 'signature', label: 'Signature' }
        },
        {
          label: 'Payment',
          type: 'payment',
          icon: '💳',
          schema: { type: 'payment', key: 'payment', label: 'Payment' }
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.initializeBuilder();
  }

  ngOnDestroy(): void {
    this.builderInstance?.destroy(true);
    this.builderInstance = null;
  }

  private async initializeBuilder(): Promise<void> {
    try {
      const builderContainer = document.getElementById('formBuilder');
      if (!builderContainer) return;

      // Create an empty form that will serve as the builder canvas
      this.builderInstance = await Formio.createForm(
        builderContainer,
        {
          display: 'form',
          type: 'form',
          title: 'New Form',
          components: []
        },
        {
          noAlerts: true,
          readOnly: false
        }
      );

      this.loading = false;
    } catch (err: any) {
      this.error = err.message || 'Failed to initialize form builder';
      this.loading = false;
      console.error('Error initializing form builder:', err);
    }
  }

  addComponent(component: ComponentItem): void {
    if (!this.builderInstance?.webform) return;

    const newKey = `${component.type}_${Date.now()}`;
    const componentSchema = {
      ...component.schema,
      key: newKey
    };

    // Add component to the form
    this.builderInstance.root.addComponent(componentSchema);
  }

  toggleCategory(categoryName: string): void {
    const category = this.componentCategories.find(c => c.name === categoryName);
    if (category) {
      category.expanded = !category.expanded;
      this.expandedCategory.set(category.expanded ? categoryName : null);
    }
  }

  getFilteredCategories() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.componentCategories;

    return this.componentCategories
      .map(cat => ({
        ...cat,
        components: cat.components.filter(comp =>
          comp.label.toLowerCase().includes(query)
        ),
        expanded: cat.components.some(comp =>
          comp.label.toLowerCase().includes(query)
        )
      }))
      .filter(cat => cat.components.length > 0);
  }

  back(): void {
    this.router.navigate(['/organization']);
  }
}
