// Admin API exports
export * from './config';
export * from './tableBuilder';

// Form Builder exports (with aliases for conflicting names)
export {
  getForms,
  getForm,
  saveForm,
  deleteForm,
  duplicateForm,
  getSections,
  saveSections,
  getFields as getFormFields,
  saveFields as saveFormFields,
  deleteField as deleteFormField,
  getFieldTypes,
  getDefaultFormSettings,
  getDefaultSection,
  getDefaultField as getDefaultFormField,
  fieldTypeDefinitions,
} from './formBuilder';
export type {
  DynamicFormSection,
  DynamicFormField,
  DynamicForm,
  FieldType,
} from './formBuilder';

// Report Builder exports (with aliases for conflicting names)
export {
  getReports,
  getReport,
  saveReport,
  deleteReport,
  duplicateReport,
  saveFields as saveReportFields,
  saveParameters,
  saveCharts,
  getSchedules,
  saveSchedule,
  deleteSchedule,
  getChartTypes,
  getReportCategories,
  getDefaultReportSettings,
  getDefaultField as getDefaultReportField,
  getDefaultParameter,
  getDefaultChart,
  chartTypeDefinitions,
} from './reportBuilder';
export type {
  DynamicReportField,
  DynamicReportParameter,
  DynamicReportChart,
  DynamicReportSchedule,
  DynamicReport,
  ChartType,
} from './reportBuilder';
