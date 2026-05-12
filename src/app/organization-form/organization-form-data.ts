export const ORGANIZATION_FORM = {
  "components": [

    // ──────────── TEXT FIELD ────────────
    {
      "label": "Full Name",
      "key": "fullName",
      "type": "textfield",
      "input": true,
      "placeholder": "Enter your name",
      "validate": {
        "required": true,
        "minLength": 2,
        "maxLength": 100
      }
    },

    // ──────────── EMAIL ────────────
    {
      "label": "Email",
      "key": "email",
      "type": "email",
      "input": true,
      "placeholder": "Enter your email",
      "validate": {
        "required": true
      }
    },

    // ──────────── PHONE NUMBER ────────────
    {
      "label": "Phone Number",
      "key": "phoneNumber",
      "type": "phoneNumber",
      "input": true,
      "placeholder": "Enter phone number"
    },

    // ──────────── DROPDOWN / SELECT ────────────
    {
      "label": "Department",
      "key": "department",
      "type": "select",
      "input": true,
      "placeholder": "Select department",
      "validate": { "required": true },
      "data": {
        "values": [
          { "label": "HR", "value": "hr" },
          { "label": "Engineering", "value": "engineering" },
          { "label": "Finance", "value": "finance" },
          { "label": "Marketing", "value": "marketing" }
        ]
      }
    },

    // ──────────── DATE PICKER ────────────
    {
      "label": "Date of Birth",
      "key": "dateOfBirth",
      "type": "datetime",
      "input": true,
      "format": "dd-MM-yyyy",
      "enableDate": true,
      "enableTime": false,
      "validate": { "required": true }
    },

    // ──────────── NUMBER ────────────
    {
      "label": "Age",
      "key": "age",
      "type": "number",
      "input": true,
      "validate": {
        "required": true,
        "min": 18,
        "max": 100
      }
    },

    // ──────────── TEXTAREA ────────────
    {
      "label": "Address",
      "key": "address",
      "type": "textarea",
      "input": true,
      "rows": 3,
      "placeholder": "Enter your full address"
    },

    // ──────────── RADIO BUTTONS ────────────
    {
      "label": "Gender",
      "key": "gender",
      "type": "radio",
      "input": true,
      "values": [
        { "label": "Male", "value": "male" },
        { "label": "Female", "value": "female" },
        { "label": "Other", "value": "other" }
      ],
      "validate": { "required": true }
    },

    // ──────────── CHECKBOX ────────────
    {
      "label": "I agree to the Terms & Conditions",
      "key": "agreeTerms",
      "type": "checkbox",
      "input": true,
      "validate": { "required": true }
    },

    // ──────────── FILE UPLOAD ────────────
    {
      "label": "Upload Resume",
      "key": "resume",
      "type": "file",
      "input": true,
      "storage": "base64",
      "multiple": false,
      "filePattern": ".pdf,.doc,.docx",
      "fileMaxSize": "10MB",
      "displayAsDropZone": true,
      "description": "Drag and drop your resume here or click to browse (PDF, DOC, DOCX only)"
    },

    // ──────────── COLUMNS (Side-by-Side Layout) ────────────
    {
      "label": "Columns",
      "type": "columns",
      "input": false,
      "columns": [
        {
          "width": 6,
          "components": [
            {
              "label": "City",
              "key": "city",
              "type": "textfield",
              "input": true
            }
          ]
        },
        {
          "width": 6,
          "components": [
            {
              "label": "State",
              "key": "state",
              "type": "textfield",
              "input": true
            }
          ]
        }
      ]
    },

    // ──────────── PANEL (Grouped Section) ────────────
    {
      "label": "Emergency Contact",
      "type": "panel",
      "input": false,
      "collapsible": true,
      "collapsed": false,
      "components": [
        {
          "label": "Contact Name",
          "key": "emergencyName",
          "type": "textfield",
          "input": true
        },
        {
          "label": "Contact Phone",
          "key": "emergencyPhone",
          "type": "phoneNumber",
          "input": true
        }
      ]
    },

    // ──────────── HIDDEN FIELD ────────────
    {
      "label": "Form Version",
      "key": "formVersion",
      "type": "hidden",
      "input": true,
      "defaultValue": "1.0"
    },

    // ──────────── SUBMIT BUTTON ────────────
    {
      "label": "Submit",
      "key": "submit",
      "type": "button",
      "action": "submit",
      "input": true,
      "theme": "primary",
      "block": true
    }
  ]
};
