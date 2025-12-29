<?php

return [
    // Navigation
    'navigation' => [
        'dashboard' => 'Dashboard',
        'admissions' => 'Admissions',
        'admission_applications' => 'Admission Applications',
        'academic_management' => 'Academic Management',
        'system_management' => 'System Management',
        'content_management' => 'Content Management',
        'dynamic_content' => 'Dynamic Content Builder',
        'dynamic_forms' => 'Dynamic Forms',
        'dynamic_tables' => 'Dynamic Tables',
        'dynamic_reports' => 'Dynamic Reports',
        'students' => 'Students',
        'academics' => 'Academics',
        'courses' => 'Courses',
        'programs' => 'Programs',
        'departments' => 'Departments',
        'colleges' => 'Colleges',
        'semesters' => 'Semesters',
        'enrollments' => 'Enrollments',
        'grades' => 'Grades',
        'finance' => 'Finance',
        'financial_records' => 'Financial Records',
        'announcements' => 'Announcements',
        'service_requests' => 'Service Requests',
        'schedules' => 'Schedules',
        'academic_events' => 'Academic Events',
        'notifications' => 'Notifications',
        'prerequisites' => 'Prerequisites',
        'users' => 'Users',
        'audit_logs' => 'Audit Logs',
        'settings' => 'Settings',
    ],

    // Dynamic Form
    'dynamic_form' => [
        'singular' => 'Dynamic Form',
        'plural' => 'Dynamic Forms',
    ],

    // Dynamic Table
    'dynamic_table' => [
        'singular' => 'Dynamic Table',
        'plural' => 'Dynamic Tables',
    ],

    // Dynamic Report
    'dynamic_report' => [
        'singular' => 'Dynamic Report',
        'plural' => 'Dynamic Reports',
    ],

    // Tabs
    'tabs' => [
        'basic_info' => 'Basic Info',
        'data_source' => 'Data Source',
        'settings' => 'Settings',
        'workflow' => 'Workflow',
        'table_settings' => 'Table Settings',
        'sorting' => 'Sorting',
        'actions' => 'Actions',
        'access' => 'Access Control',
    ],

    // Sections
    'sections' => [
        'form_identity' => 'Form Identity',
        'table_identity' => 'Table Identity',
        'report_identity' => 'Report Identity',
        'target_configuration' => 'Target Configuration',
        'data_configuration' => 'Data Configuration',
        'form_settings' => 'Form Settings',
        'access_control' => 'Access Control',
        'form_behavior' => 'Form Behavior',
        'submission_workflow' => 'Submission Workflow',
        'features' => 'Features',
        'pagination' => 'Pagination',
        'export' => 'Export Options',
    ],

    // Fields
    'fields' => [
        'code' => 'Code',
        'category' => 'Category',
        'name_en' => 'Name (English)',
        'name_ar' => 'Name (Arabic)',
        'description_en' => 'Description (English)',
        'description_ar' => 'Description (Arabic)',
        'target_table' => 'Target Table',
        'target_model' => 'Target Model',
        'data_source' => 'Data Source',
        'data_model' => 'Data Model',
        'is_active' => 'Active',
        'requires_auth' => 'Requires Authentication',
        'sort_order' => 'Sort Order',
        'allowed_roles' => 'Allowed Roles',
        'additional_settings' => 'Additional Settings',
        'workflow_steps' => 'Workflow Steps',
        'fields_count' => 'Fields',
        'sections_count' => 'Sections',
        'submissions_count' => 'Submissions',
        'created_at' => 'Created At',
    ],

    // Admission Application
    'admission_application' => [
        'title' => 'Admission Applications',
        'singular' => 'Admission Application',
        'plural' => 'Admission Applications',
        'create' => 'Create Admission Application',
        'edit' => 'Edit Admission Application',
        'view' => 'View Admission Application',

        // Sections
        'applicant_information' => 'Applicant Information',
        'application_details' => 'Application Details',
        'personal_info' => 'Personal Information',
        'education_info' => 'Education Information',

        // Fields
        'full_name' => 'Full Name',
        'national_id' => 'National ID',
        'email' => 'Email',
        'phone' => 'Phone',
        'program' => 'Program',
        'program_id' => 'Program',
        'program_name' => 'Program Name',
        'high_school_score' => 'High School Score',
        'date' => 'Application Date',
        'status' => 'Status',
        'notes' => 'Notes',
        'created_at' => 'Created At',
        'updated_at' => 'Updated At',
        'date_of_birth' => 'Date of Birth',
        'gender' => 'Gender',
        'nationality' => 'Nationality',
        'address' => 'Address',
        'high_school_name' => 'High School Name',
        'high_school_year' => 'Graduation Year',

        // Status Options
        'status_pending' => 'Pending',
        'status_approved' => 'Approved',
        'status_rejected' => 'Rejected',
        'status_waitlisted' => 'Waitlisted',

        // Gender Options
        'gender_male' => 'Male',
        'gender_female' => 'Female',

        // Actions
        'approve' => 'Approve',
        'reject' => 'Reject',
        'waitlist' => 'Add to Waitlist',
        'approve_confirmation' => 'Are you sure you want to approve this application?',
        'reject_confirmation' => 'Are you sure you want to reject this application?',
    ],

    // Common
    'common' => [
        'create' => 'Create',
        'edit' => 'Edit',
        'delete' => 'Delete',
        'save' => 'Save',
        'cancel' => 'Cancel',
        'search' => 'Search',
        'filter' => 'Filter',
        'actions' => 'Actions',
        'yes' => 'Yes',
        'no' => 'No',
        'confirm' => 'Confirm',
        'back' => 'Back',
        'next' => 'Next',
        'previous' => 'Previous',
        'loading' => 'Loading...',
        'no_results' => 'No results found',
        'showing' => 'Showing',
        'of' => 'of',
        'results' => 'results',
        'all' => 'All',
        'select' => 'Select',
        'required' => 'Required',
    ],

    // Student
    'student' => [
        'title' => 'Students',
        'singular' => 'Student',
        'plural' => 'Students',
        'student_id' => 'Student ID',
        'full_name_en' => 'Full Name (English)',
        'full_name_ar' => 'Full Name (Arabic)',
        'national_id' => 'National ID',
        'email' => 'Email',
        'phone' => 'Phone',
        'date_of_birth' => 'Date of Birth',
        'gender' => 'Gender',
        'program' => 'Program',
        'status' => 'Status',
        'admission_date' => 'Admission Date',
        'gpa' => 'GPA',
        'total_credits' => 'Total Credits',
    ],

    // Course
    'course' => [
        'title' => 'Courses',
        'singular' => 'Course',
        'plural' => 'Courses',
        'code' => 'Course Code',
        'name_en' => 'Course Name (English)',
        'name_ar' => 'Course Name (Arabic)',
        'credits' => 'Credits',
        'department' => 'Department',
        'capacity' => 'Capacity',
        'is_active' => 'Active',
    ],

    // Program
    'program' => [
        'title' => 'Programs',
        'singular' => 'Program',
        'plural' => 'Programs',
        'name_en' => 'Program Name (English)',
        'name_ar' => 'Program Name (Arabic)',
        'code' => 'Program Code',
        'department' => 'Department',
        'type' => 'Type',
        'total_credits' => 'Total Credits',
    ],

    // Department
    'department' => [
        'title' => 'Departments',
        'singular' => 'Department',
        'plural' => 'Departments',
        'name_en' => 'Department Name (English)',
        'name_ar' => 'Department Name (Arabic)',
        'code' => 'Department Code',
        'college' => 'College',
    ],

    // College
    'college' => [
        'title' => 'Colleges',
        'singular' => 'College',
        'plural' => 'Colleges',
        'name_en' => 'College Name (English)',
        'name_ar' => 'College Name (Arabic)',
        'code' => 'College Code',
    ],

    // Semester
    'semester' => [
        'title' => 'Semesters',
        'singular' => 'Semester',
        'plural' => 'Semesters',
        'name_en' => 'Semester Name (English)',
        'name_ar' => 'Semester Name (Arabic)',
        'academic_year' => 'Academic Year',
        'start_date' => 'Start Date',
        'end_date' => 'End Date',
        'is_current' => 'Current Semester',
    ],

    // Grade
    'grade' => [
        'title' => 'Grades',
        'singular' => 'Grade',
        'plural' => 'Grades',
        'student' => 'Student',
        'course' => 'Course',
        'semester' => 'Semester',
        'midterm' => 'Midterm',
        'final' => 'Final',
        'coursework' => 'Coursework',
        'total' => 'Total',
        'grade' => 'Grade',
        'points' => 'Points',
        'status' => 'Status',
    ],

    // Financial Record
    'financial_record' => [
        'title' => 'Financial Records',
        'singular' => 'Financial Record',
        'plural' => 'Financial Records',
        'student' => 'Student',
        'date' => 'Date',
        'description' => 'Description',
        'amount' => 'Amount',
        'type' => 'Type',
        'status' => 'Status',
        'reference_number' => 'Reference Number',
        'type_debit' => 'Debit',
        'type_credit' => 'Credit',
        'status_pending' => 'Pending',
        'status_paid' => 'Paid',
        'status_overdue' => 'Overdue',
    ],

    // Announcement
    'announcement' => [
        'title' => 'Announcements',
        'singular' => 'Announcement',
        'plural' => 'Announcements',
        'title_en' => 'Title (English)',
        'title_ar' => 'Title (Arabic)',
        'content_en' => 'Content (English)',
        'content_ar' => 'Content (Arabic)',
        'type' => 'Type',
        'is_published' => 'Published',
        'published_at' => 'Published At',
    ],

    // User
    'user' => [
        'title' => 'Users',
        'singular' => 'User',
        'plural' => 'Users',
        'name' => 'Name',
        'email' => 'Email',
        'role' => 'Role',
        'password' => 'Password',
        'password_confirmation' => 'Password Confirmation',
    ],

    // Enrollment
    'enrollment' => [
        'title' => 'Enrollments',
        'singular' => 'Enrollment',
        'plural' => 'Enrollments',
    ],

    // Schedule
    'schedule' => [
        'title' => 'Schedules',
        'singular' => 'Schedule',
        'plural' => 'Schedules',
    ],

    // Service Request
    'service_request' => [
        'title' => 'Service Requests',
        'singular' => 'Service Request',
        'plural' => 'Service Requests',
    ],

    // Academic Event
    'academic_event' => [
        'title' => 'Academic Events',
        'singular' => 'Academic Event',
        'plural' => 'Academic Events',
    ],

    // Notification
    'notification' => [
        'title' => 'Notifications',
        'singular' => 'Notification',
        'plural' => 'Notifications',
    ],

    // Audit Log
    'audit_log' => [
        'title' => 'Audit Logs',
        'singular' => 'Audit Log',
        'plural' => 'Audit Logs',
    ],

    // Course Prerequisite
    'course_prerequisite' => [
        'title' => 'Prerequisites',
        'singular' => 'Prerequisite',
        'plural' => 'Prerequisites',
    ],

    // Settings
    'settings' => [
        'title' => 'Settings',
        'singular' => 'Setting',
        'plural' => 'Settings',
        'general' => 'General',
        'academic' => 'Academic',
        'registration' => 'Registration',
        'financial' => 'Financial',
        'system' => 'System',
        'save_settings' => 'Save Settings',
        'saved' => 'Settings saved successfully',

        // General Settings
        'site_information' => 'Site Information',
        'site_name_en' => 'Site Name (English)',
        'site_name_ar' => 'Site Name (Arabic)',
        'site_description_en' => 'Site Description (English)',
        'site_description_ar' => 'Site Description (Arabic)',
        'site_logo' => 'Site Logo',
        'site_favicon' => 'Site Favicon',
        'contact_information' => 'Contact Information',
        'contact_email' => 'Contact Email',
        'contact_phone' => 'Contact Phone',
        'contact_address_en' => 'Address (English)',
        'contact_address_ar' => 'Address (Arabic)',

        // Academic Settings
        'academic_settings' => 'Academic Settings',
        'current_academic_year' => 'Current Academic Year',
        'gpa_scale' => 'GPA Scale',
        'max_credits' => 'Maximum Credits per Semester',
        'min_credits' => 'Minimum Credits per Semester',
        'passing_grade' => 'Passing Grade',

        // Registration Settings
        'registration_settings' => 'Registration Settings',
        'registration_open' => 'Registration Open',
        'registration_open_help' => 'Allow students to register for courses',
        'late_registration' => 'Allow Late Registration',
        'drop_deadline' => 'Drop Deadline',
        'withdrawal_deadline' => 'Withdrawal Deadline',
        'days' => 'days',

        // Financial Settings
        'financial_settings' => 'Financial Settings',
        'currency' => 'Currency',
        'currency_symbol' => 'Currency Symbol',
        'payment_due_days' => 'Payment Due Days',
        'late_payment_fee' => 'Late Payment Fee',

        // System Settings
        'system_settings' => 'System Settings',
        'default_language' => 'Default Language',
        'timezone' => 'Timezone',
        'maintenance_mode' => 'Maintenance Mode',
        'maintenance_mode_help' => 'Enabling maintenance mode will prevent access to the system',
        'smtp_enabled' => 'SMTP Enabled',
        'mail_from_name' => 'Mail From Name',
        'mail_from_address' => 'Mail From Address',
    ],
];
