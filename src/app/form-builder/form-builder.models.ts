export type FieldType =
  | 'text' | 'email' | 'number' | 'tel' | 'url' | 'password'
  | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'toggle'
  | 'date' | 'time' | 'datetime'
  | 'file' | 'image'
  | 'rating' | 'slider' | 'color' | 'signature'
  | 'heading' | 'paragraph' | 'divider' | 'spacer';

export interface FieldOption { id: string; label: string; value: string; }

export interface ValidationRule {
  id: string;
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'url';
  value: string;
  message: string;
  enabled: boolean;
}

export interface ConditionalRule {
  id: string;
  sourceFieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
  action: 'show' | 'hide' | 'require' | 'disable';
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  helpText: string;
  defaultValue: string;
  options: FieldOption[];
  validation: ValidationRule[];
  conditions: ConditionalRule[];
  width: 'full' | 'half' | 'third';
  required: boolean;
  accept: string;
  multiple: boolean;
  min: number;
  max: number;
  step: number;
  rows: number;
  level: 1 | 2 | 3;
  content: string;
  maxRating: number;
  maxSize: number;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

export interface FormTheme {
  primaryColor: string;
  labelColor: string;
  bgColor: string;
  borderColor: string;
  borderRadius: string;
  fontFamily: string;
  fontSize: string;
}

export interface FormIntegration {
  id: string;
  type: 'webhook' | 'email' | 'slack' | 'zapier' | 'sheets';
  name: string;
  icon: string;
  enabled: boolean;
  config: Record<string, string>;
}

export interface FormConfig {
  id: string;
  title: string;
  description: string;
  isMultiStep: boolean;
  submitLabel: string;
  successMessage: string;
  steps: FormStep[];
  theme: FormTheme;
  integrations: FormIntegration[];
  isDraft: boolean;
  lastSaved: string | null;
}

export interface PaletteItem {
  type: FieldType;
  label: string;
  icon: string;
  group: string;
  color: string;
  description: string;
}

export const FIELD_GROUPS: { name: string; color: string; icon: string; items: PaletteItem[] }[] = [
  {
    name: 'Basic', color: '#6366f1', icon: 'T',
    items: [
      { type: 'text',     label: 'Short Text',  icon: 'T',  group: 'Basic', color: '#6366f1', description: 'Single line text' },
      { type: 'email',    label: 'Email',       icon: '@',  group: 'Basic', color: '#6366f1', description: 'Email address' },
      { type: 'number',   label: 'Number',      icon: '12', group: 'Basic', color: '#6366f1', description: 'Numeric value' },
      { type: 'tel',      label: 'Phone',       icon: 'ph', group: 'Basic', color: '#6366f1', description: 'Phone number' },
      { type: 'url',      label: 'Website',     icon: '↗',  group: 'Basic', color: '#6366f1', description: 'URL input' },
      { type: 'password', label: 'Password',    icon: '••', group: 'Basic', color: '#6366f1', description: 'Secure field' },
      { type: 'textarea', label: 'Long Text',   icon: '¶',  group: 'Basic', color: '#6366f1', description: 'Multi-line text' },
    ]
  },
  {
    name: 'Choice', color: '#0d9488', icon: '◉',
    items: [
      { type: 'select',      label: 'Dropdown',    icon: '▾',  group: 'Choice', color: '#0d9488', description: 'Single select' },
      { type: 'multiselect', label: 'Multi-select', icon: '▿▿', group: 'Choice', color: '#0d9488', description: 'Multiple select' },
      { type: 'radio',       label: 'Radio',        icon: '◎',  group: 'Choice', color: '#0d9488', description: 'Single choice' },
      { type: 'checkbox',    label: 'Checkboxes',   icon: '☑',  group: 'Choice', color: '#0d9488', description: 'Multi-check' },
      { type: 'toggle',      label: 'Toggle',       icon: '⬭',  group: 'Choice', color: '#0d9488', description: 'On/off switch' },
    ]
  },
  {
    name: 'Date & Time', color: '#d97706', icon: '📅',
    items: [
      { type: 'date',     label: 'Date',      icon: '▦', group: 'Date & Time', color: '#d97706', description: 'Date picker' },
      { type: 'time',     label: 'Time',      icon: '◷', group: 'Date & Time', color: '#d97706', description: 'Time picker' },
      { type: 'datetime', label: 'Date & Time', icon: '▦◷', group: 'Date & Time', color: '#d97706', description: 'Date + time' },
    ]
  },
  {
    name: 'Upload', color: '#7c3aed', icon: '↑',
    items: [
      { type: 'file',  label: 'File Upload',  icon: '↑', group: 'Upload', color: '#7c3aed', description: 'Any file type' },
      { type: 'image', label: 'Image Upload', icon: '⬡', group: 'Upload', color: '#7c3aed', description: 'Images only' },
    ]
  },
  {
    name: 'Advanced', color: '#e11d48', icon: '★',
    items: [
      { type: 'rating',    label: 'Star Rating', icon: '★',  group: 'Advanced', color: '#e11d48', description: 'Star rating' },
      { type: 'slider',    label: 'Slider',      icon: '⊣⊢', group: 'Advanced', color: '#e11d48', description: 'Range slider' },
      { type: 'color',     label: 'Color Picker', icon: '◈', group: 'Advanced', color: '#e11d48', description: 'Color picker' },
      { type: 'signature', label: 'Signature',   icon: '✍',  group: 'Advanced', color: '#e11d48', description: 'Draw signature' },
    ]
  },
  {
    name: 'Layout', color: '#64748b', icon: '▭',
    items: [
      { type: 'heading',   label: 'Heading',   icon: 'H',  group: 'Layout', color: '#64748b', description: 'Section title' },
      { type: 'paragraph', label: 'Paragraph', icon: 'P',  group: 'Layout', color: '#64748b', description: 'Static text' },
      { type: 'divider',   label: 'Divider',   icon: '—',  group: 'Layout', color: '#64748b', description: 'Separator line' },
      { type: 'spacer',    label: 'Spacer',    icon: '□',  group: 'Layout', color: '#64748b', description: 'Blank space' },
    ]
  },
];

export const ALL_PALETTE_ITEMS: PaletteItem[] = FIELD_GROUPS.flatMap(g => g.items);

export const DEFAULT_THEME: FormTheme = {
  primaryColor: '#6366f1',
  labelColor: '#374151',
  bgColor: '#ffffff',
  borderColor: '#d1d5db',
  borderRadius: '8px',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '14px',
};

export const FORM_TEMPLATES: {
  id: string; name: string; description: string; category: string; icon: string; fieldCount: number;
  steps: { title: string; description: string; fields: Partial<FormField>[] }[];
}[] = [
  {
    id: 'contact', name: 'Contact Form', description: 'Simple contact form for inquiries', category: 'General', icon: '✉', fieldCount: 4,
    steps: [{ title: 'Contact Us', description: '', fields: [
      { type: 'text',     label: 'Full Name',     placeholder: 'John Doe', required: true,  width: 'half' },
      { type: 'email',    label: 'Email Address', placeholder: 'john@example.com', required: true, width: 'half' },
      { type: 'text',     label: 'Subject',       placeholder: 'How can we help?', required: false, width: 'full' },
      { type: 'textarea', label: 'Message',       placeholder: 'Your message...', required: true, width: 'full', rows: 4 },
    ]}]
  },
  {
    id: 'registration', name: 'User Registration', description: 'Full account registration form', category: 'Auth', icon: '👤', fieldCount: 5,
    steps: [{ title: 'Create Account', description: '', fields: [
      { type: 'text',     label: 'Full Name',    placeholder: 'Your full name', required: true, width: 'half' },
      { type: 'email',    label: 'Email',        placeholder: 'email@company.com', required: true, width: 'half' },
      { type: 'tel',      label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: false, width: 'half' },
      { type: 'text',     label: 'Company',      placeholder: 'Your company', required: false, width: 'half' },
      { type: 'password', label: 'Password',     placeholder: 'Create a password', required: true, width: 'full' },
    ]}]
  },
  {
    id: 'job-application', name: 'Job Application', description: 'Professional job application with resume', category: 'HR', icon: '💼', fieldCount: 6,
    steps: [
      { title: 'Personal Info', description: 'Tell us about yourself', fields: [
        { type: 'text',  label: 'Full Name', required: true, width: 'half' },
        { type: 'email', label: 'Email Address', required: true, width: 'half' },
        { type: 'tel',   label: 'Phone', required: true, width: 'half' },
        { type: 'select', label: 'Position Applied For', required: true, width: 'half',
          options: [
            { id: 'p1', label: 'Software Engineer', value: 'se' },
            { id: 'p2', label: 'Product Manager', value: 'pm' },
            { id: 'p3', label: 'Designer', value: 'design' },
          ]},
      ]},
      { title: 'Experience', description: 'Your background', fields: [
        { type: 'number',   label: 'Years of Experience', min: 0, max: 30, required: true, width: 'half' },
        { type: 'file',     label: 'Resume / CV', required: true, width: 'full', accept: '.pdf,.doc,.docx' },
        { type: 'textarea', label: 'Cover Letter', required: false, width: 'full', rows: 5 },
      ]},
    ]
  },
  {
    id: 'survey', name: 'Customer Survey', description: 'NPS and satisfaction survey', category: 'Feedback', icon: '📊', fieldCount: 5,
    steps: [{ title: 'Share Your Feedback', description: 'Takes 2 minutes', fields: [
      { type: 'heading',  content: 'Tell us about your experience', level: 2, width: 'full' },
      { type: 'rating',   label: 'Overall Satisfaction', required: true, width: 'full', maxRating: 5 },
      { type: 'radio',    label: 'How did you find us?', required: false, width: 'full',
        options: [
          { id: 'r1', label: 'Search engine', value: 'search' },
          { id: 'r2', label: 'Social media', value: 'social' },
          { id: 'r3', label: 'Friend or colleague', value: 'referral' },
          { id: 'r4', label: 'Advertisement', value: 'ad' },
        ]},
      { type: 'checkbox', label: 'Features you use', required: false, width: 'full',
        options: [
          { id: 'c1', label: 'Dashboard', value: 'dashboard' },
          { id: 'c2', label: 'Analytics', value: 'analytics' },
          { id: 'c3', label: 'Reports', value: 'reports' },
        ]},
      { type: 'textarea', label: 'Additional comments', required: false, width: 'full', rows: 3 },
    ]}]
  },
  {
    id: 'event', name: 'Event Registration', description: 'Register attendees for events', category: 'Events', icon: '🎫', fieldCount: 5,
    steps: [{ title: 'Register for the Event', description: '', fields: [
      { type: 'text',  label: 'Full Name', required: true, width: 'half' },
      { type: 'email', label: 'Email',     required: true, width: 'half' },
      { type: 'select', label: 'Ticket Type', required: true, width: 'half',
        options: [
          { id: 't1', label: 'General Admission', value: 'general' },
          { id: 't2', label: 'VIP', value: 'vip' },
          { id: 't3', label: 'Online Only', value: 'online' },
        ]},
      { type: 'select', label: 'Dietary Preferences', required: false, width: 'half',
        options: [
          { id: 'd1', label: 'None', value: 'none' },
          { id: 'd2', label: 'Vegetarian', value: 'veg' },
          { id: 'd3', label: 'Vegan', value: 'vegan' },
          { id: 'd4', label: 'Gluten-free', value: 'gf' },
        ]},
      { type: 'toggle', label: 'I agree to the event terms and conditions', required: true, width: 'full' },
    ]}]
  },
  {
    id: 'feedback', name: 'Product Feedback', description: 'Collect product feedback', category: 'Feedback', icon: '💬', fieldCount: 4,
    steps: [{ title: 'Product Feedback', description: '', fields: [
      { type: 'rating',   label: 'How would you rate this product?', required: true, width: 'full', maxRating: 5 },
      { type: 'slider',   label: 'How likely are you to recommend us? (0–10)', min: 0, max: 10, width: 'full' },
      { type: 'checkbox', label: 'What do you like most?', required: false, width: 'full',
        options: [
          { id: 'fl1', label: 'Ease of use', value: 'ease' },
          { id: 'fl2', label: 'Performance', value: 'perf' },
          { id: 'fl3', label: 'Design', value: 'design' },
          { id: 'fl4', label: 'Features', value: 'features' },
        ]},
      { type: 'textarea', label: 'What would you like to improve?', required: false, width: 'full', rows: 3 },
    ]}]
  },
];

export const AI_SUGGESTION_POOLS: Partial<FormField>[][] = [
  [
    { type: 'text',   label: 'Organization Name', placeholder: 'Company or individual', required: true, width: 'full' },
    { type: 'select', label: 'Priority Level', width: 'half',
      options: [{ id: 'p1', label: 'Low', value: 'low' }, { id: 'p2', label: 'Medium', value: 'med' }, { id: 'p3', label: 'High', value: 'high' }] },
    { type: 'file',   label: 'Supporting Documents', width: 'full', accept: '.pdf,.doc,.png,.jpg' },
    { type: 'toggle', label: 'Notify me about updates', width: 'half' },
  ],
  [
    { type: 'slider',   label: 'Satisfaction Score (0–10)', min: 0, max: 10, width: 'full' },
    { type: 'radio',    label: 'Preferred contact method', width: 'full',
      options: [{ id: 'm1', label: 'Email', value: 'email' }, { id: 'm2', label: 'Phone', value: 'phone' }, { id: 'm3', label: 'Chat', value: 'chat' }] },
    { type: 'date',     label: 'Preferred Follow-up Date', width: 'half' },
    { type: 'textarea', label: 'Additional Notes', rows: 3, width: 'full' },
  ],
  [
    { type: 'text',   label: 'LinkedIn Profile URL', placeholder: 'https://linkedin.com/in/...', width: 'full' },
    { type: 'number', label: 'Expected Salary (USD)', min: 0, width: 'half' },
    { type: 'select', label: 'Work Mode Preference', width: 'half',
      options: [{ id: 'w1', label: 'Remote', value: 'remote' }, { id: 'w2', label: 'Hybrid', value: 'hybrid' }, { id: 'w3', label: 'On-site', value: 'onsite' }] },
    { type: 'checkbox', label: 'Availability', width: 'full',
      options: [{ id: 'a1', label: 'Weekdays', value: 'weekdays' }, { id: 'a2', label: 'Weekends', value: 'weekends' }, { id: 'a3', label: 'Evenings', value: 'evenings' }] },
  ],
];
