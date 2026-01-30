import React, { useState, useEffect } from 'react';
import {
  Menu as MenuIcon,
  LayoutDashboard,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Check,
  AlertCircle,
  RefreshCw,
  Link,
  Eye,
  EyeOff,
  Copy,
  Settings,
  Users,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  Calendar,
  List,
} from 'lucide-react';
import * as configApi from '../../api/admin/config';
import type { Menu, MenuItem, DashboardWidget, DashboardLayout } from '../../api/admin/config';

interface MenuDashboardManagerProps {
  lang: 'en' | 'ar';
}

const t = {
  title: { en: 'Menu & Dashboard', ar: 'القوائم ولوحة التحكم' },
  subtitle: { en: 'Manage navigation menus and dashboard layouts', ar: 'إدارة قوائم التنقل وتخطيطات لوحة التحكم' },
  menus: { en: 'Menus', ar: 'القوائم' },
  dashboards: { en: 'Dashboards', ar: 'لوحات التحكم' },
  widgets: { en: 'Widgets', ar: 'الودجات' },
  addMenu: { en: 'Add Menu', ar: 'إضافة قائمة' },
  addItem: { en: 'Add Item', ar: 'إضافة عنصر' },
  addWidget: { en: 'Add Widget', ar: 'إضافة ودجت' },
  addLayout: { en: 'Add Layout', ar: 'إضافة تخطيط' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
  saved: { en: 'Saved successfully', ar: 'تم الحفظ بنجاح' },
  error: { en: 'An error occurred', ar: 'حدث خطأ' },
  active: { en: 'Active', ar: 'نشط' },
  inactive: { en: 'Inactive', ar: 'غير نشط' },
  default: { en: 'Default', ar: 'افتراضي' },
  confirmDelete: { en: 'Are you sure you want to delete this?', ar: 'هل أنت متأكد من الحذف؟' },

  // Menu fields
  menuCode: { en: 'Menu Code', ar: 'كود القائمة' },
  menuName: { en: 'Menu Name', ar: 'اسم القائمة' },
  location: { en: 'Location', ar: 'الموقع' },
  sidebar: { en: 'Sidebar', ar: 'الشريط الجانبي' },
  header: { en: 'Header', ar: 'الرأس' },
  footer: { en: 'Footer', ar: 'التذييل' },
  noMenus: { en: 'No menus found', ar: 'لا توجد قوائم' },
  noItems: { en: 'No items in this menu', ar: 'لا توجد عناصر في هذه القائمة' },

  // Menu item fields
  itemLabel: { en: 'Label', ar: 'العنوان' },
  itemIcon: { en: 'Icon', ar: 'الأيقونة' },
  itemRoute: { en: 'Route', ar: 'المسار' },
  itemUrl: { en: 'External URL', ar: 'رابط خارجي' },
  itemTarget: { en: 'Target', ar: 'الهدف' },
  itemRoles: { en: 'Roles', ar: 'الأدوار' },
  subItems: { en: 'Sub Items', ar: 'عناصر فرعية' },

  // Widget fields
  widgetCode: { en: 'Widget Code', ar: 'كود الودجت' },
  widgetName: { en: 'Widget Name', ar: 'اسم الودجت' },
  widgetType: { en: 'Widget Type', ar: 'نوع الودجت' },
  dataSource: { en: 'Data Source', ar: 'مصدر البيانات' },
  stat: { en: 'Statistic', ar: 'إحصائية' },
  chart: { en: 'Chart', ar: 'رسم بياني' },
  table: { en: 'Table', ar: 'جدول' },
  list: { en: 'List', ar: 'قائمة' },
  calendar: { en: 'Calendar', ar: 'تقويم' },
  custom: { en: 'Custom', ar: 'مخصص' },
  noWidgets: { en: 'No widgets found', ar: 'لا توجد ودجات' },

  // Layout fields
  layoutCode: { en: 'Layout Code', ar: 'كود التخطيط' },
  layoutName: { en: 'Layout Name', ar: 'اسم التخطيط' },
  layoutRole: { en: 'For Role', ar: 'للدور' },
  isDefault: { en: 'Default Layout', ar: 'التخطيط الافتراضي' },
  noLayouts: { en: 'No layouts found', ar: 'لا توجد تخطيطات' },
  selectWidgets: { en: 'Select Widgets', ar: 'اختر الودجات' },
};

const widgetTypeIcons: Record<string, React.ComponentType<any>> = {
  stat: TrendingUp,
  chart: BarChart3,
  table: List,
  list: List,
  calendar: Calendar,
  custom: Settings,
};

const MenuDashboardManager: React.FC<MenuDashboardManagerProps> = ({ lang }) => {
  const isRTL = lang === 'ar';

  // State
  const [activeTab, setActiveTab] = useState<'menus' | 'widgets' | 'dashboards'>('menus');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data state
  const [menus, setMenus] = useState<Menu[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);

  // Editor state
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showMenuEditor, setShowMenuEditor] = useState(false);
  const [menuFormData, setMenuFormData] = useState<Partial<Menu>>({});

  const [showWidgetEditor, setShowWidgetEditor] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const [widgetFormData, setWidgetFormData] = useState<Partial<DashboardWidget>>({});

  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [editingLayout, setEditingLayout] = useState<DashboardLayout | null>(null);
  const [layoutFormData, setLayoutFormData] = useState<Partial<DashboardLayout>>({});

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [menusRes, widgetsRes, layoutsRes] = await Promise.all([
        configApi.getMenus(),
        configApi.getWidgets(),
        configApi.getDashboardLayouts(),
      ]);

      if (menusRes.success) setMenus(menusRes.data);
      if (widgetsRes.success) setWidgets(widgetsRes.data);
      if (layoutsRes.success) setLayouts(layoutsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Menu handlers
  const handleAddMenu = () => {
    setMenuFormData({
      code: '',
      name_en: '',
      name_ar: '',
      location: 'sidebar',
      is_active: true,
    });
    setShowMenuEditor(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setMenuFormData({ ...menu });
    setShowMenuEditor(true);
  };

  const handleSaveMenu = async () => {
    if (!menuFormData.code || !menuFormData.name_en || !menuFormData.name_ar) {
      showMessage('error', 'Please fill in required fields');
      return;
    }

    try {
      setSaving(true);
      const response = await configApi.saveMenu(menuFormData);
      if (response.success) {
        const existingIndex = menus.findIndex(m => m.code === menuFormData.code);
        if (existingIndex >= 0) {
          setMenus(prev => prev.map((m, i) => i === existingIndex ? response.data : m));
        } else {
          setMenus(prev => [...prev, response.data]);
        }
        setShowMenuEditor(false);
        showMessage('success', t.saved[lang]);
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      showMessage('error', t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMenu = async (menu: Menu) => {
    if (!confirm(t.confirmDelete[lang])) return;

    try {
      await configApi.deleteMenu(menu.code);
      setMenus(prev => prev.filter(m => m.code !== menu.code));
      if (selectedMenu?.code === menu.code) {
        setSelectedMenu(null);
        setMenuItems([]);
      }
      showMessage('success', t.saved[lang]);
    } catch (error) {
      console.error('Error deleting menu:', error);
      showMessage('error', t.error[lang]);
    }
  };

  const handleSelectMenu = async (menu: Menu) => {
    try {
      const response = await configApi.getMenu(menu.code);
      if (response.success) {
        setSelectedMenu(response.data);
        setMenuItems(response.data.allItems || response.data.items || []);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  };

  const handleSaveMenuItems = async () => {
    if (!selectedMenu) return;

    try {
      setSaving(true);
      await configApi.saveMenuItems(selectedMenu.code, menuItems);
      showMessage('success', t.saved[lang]);
    } catch (error) {
      console.error('Error saving menu items:', error);
      showMessage('error', t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: Date.now(),
      menu_id: selectedMenu?.id || 0,
      label_en: '',
      label_ar: '',
      icon: 'circle',
      route: '',
      is_active: true,
      order: menuItems.length,
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  const updateMenuItem = (index: number, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(prev => prev.filter((_, i) => i !== index));
  };

  // Widget handlers
  const handleAddWidget = () => {
    setEditingWidget(null);
    setWidgetFormData({
      code: '',
      name_en: '',
      name_ar: '',
      type: 'stat',
      data_source: { type: 'static', value: '' },
      config: {},
      default_size: { w: 1, h: 1 },
      is_active: true,
    });
    setShowWidgetEditor(true);
  };

  const handleEditWidget = (widget: DashboardWidget) => {
    setEditingWidget(widget);
    setWidgetFormData({ ...widget });
    setShowWidgetEditor(true);
  };

  const handleSaveWidget = async () => {
    if (!widgetFormData.code || !widgetFormData.name_en || !widgetFormData.name_ar) {
      showMessage('error', 'Please fill in required fields');
      return;
    }

    try {
      setSaving(true);
      const response = await configApi.saveWidget(widgetFormData);
      if (response.success) {
        if (editingWidget) {
          setWidgets(prev => prev.map(w => w.code === editingWidget.code ? response.data : w));
        } else {
          setWidgets(prev => [...prev, response.data]);
        }
        setShowWidgetEditor(false);
        showMessage('success', t.saved[lang]);
      }
    } catch (error) {
      console.error('Error saving widget:', error);
      showMessage('error', t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWidget = async (widget: DashboardWidget) => {
    if (!confirm(t.confirmDelete[lang])) return;

    try {
      await configApi.deleteWidget(widget.code);
      setWidgets(prev => prev.filter(w => w.code !== widget.code));
      showMessage('success', t.saved[lang]);
    } catch (error) {
      console.error('Error deleting widget:', error);
      showMessage('error', t.error[lang]);
    }
  };

  // Layout handlers
  const handleAddLayout = () => {
    setEditingLayout(null);
    setLayoutFormData({
      code: '',
      name_en: '',
      name_ar: '',
      widgets: [],
      grid_settings: { cols: 12, rowHeight: 100, margin: [16, 16] },
      is_default: false,
    });
    setShowLayoutEditor(true);
  };

  const handleEditLayout = (layout: DashboardLayout) => {
    setEditingLayout(layout);
    setLayoutFormData({ ...layout });
    setShowLayoutEditor(true);
  };

  const handleSaveLayout = async () => {
    if (!layoutFormData.code || !layoutFormData.name_en || !layoutFormData.name_ar) {
      showMessage('error', 'Please fill in required fields');
      return;
    }

    try {
      setSaving(true);
      const response = await configApi.saveDashboardLayout(layoutFormData);
      if (response.success) {
        if (editingLayout) {
          setLayouts(prev => prev.map(l => l.code === editingLayout.code ? response.data : l));
        } else {
          setLayouts(prev => [...prev, response.data]);
        }
        setShowLayoutEditor(false);
        showMessage('success', t.saved[lang]);
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      showMessage('error', t.error[lang]);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLayout = async (layout: DashboardLayout) => {
    if (!confirm(t.confirmDelete[lang])) return;

    try {
      await configApi.deleteDashboardLayout(layout.code);
      setLayouts(prev => prev.filter(l => l.code !== layout.code));
      showMessage('success', t.saved[lang]);
    } catch (error) {
      console.error('Error deleting layout:', error);
      showMessage('error', t.error[lang]);
    }
  };

  const renderMenusTab = () => (
    <div className="flex gap-6">
      {/* Menu List */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">{t.menus[lang]}</h3>
            <button
              onClick={handleAddMenu}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {menus.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">{t.noMenus[lang]}</p>
          ) : (
            <div className="space-y-1">
              {menus.map((menu) => (
                <div
                  key={menu.code}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                    selectedMenu?.code === menu.code
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => handleSelectMenu(menu)}
                >
                  <div className="flex items-center gap-2">
                    <MenuIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{lang === 'ar' ? menu.name_ar : menu.name_en}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditMenu(menu); }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteMenu(menu); }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu Items Editor */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        {!selectedMenu ? (
          <div className="text-center py-12 text-gray-500">
            {lang === 'ar' ? 'اختر قائمة للتعديل' : 'Select a menu to edit'}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {lang === 'ar' ? selectedMenu.name_ar : selectedMenu.name_en}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={addMenuItem}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {t.addItem[lang]}
                </button>
                <button
                  onClick={handleSaveMenuItems}
                  disabled={saving}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t.save[lang]}
                </button>
              </div>
            </div>

            {menuItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
                {t.noItems[lang]}
              </div>
            ) : (
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />

                      <div className="flex-1 grid grid-cols-5 gap-3">
                        <div>
                          <input
                            type="text"
                            value={item.label_en || ''}
                            onChange={(e) => updateMenuItem(index, { label_en: e.target.value })}
                            placeholder="Label (EN)"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.label_ar || ''}
                            onChange={(e) => updateMenuItem(index, { label_ar: e.target.value })}
                            placeholder="Label (AR)"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                            dir="rtl"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.icon || ''}
                            onChange={(e) => updateMenuItem(index, { icon: e.target.value })}
                            placeholder="Icon"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.route || ''}
                            onChange={(e) => updateMenuItem(index, { route: e.target.value })}
                            placeholder="/path"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 font-mono"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={item.is_active ?? true}
                              onChange={(e) => updateMenuItem(index, { is_active: e.target.checked })}
                              className="rounded"
                            />
                            {t.active[lang]}
                          </label>
                          <button
                            onClick={() => removeMenuItem(index)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderWidgetsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.widgets[lang]}</h3>
        <button
          onClick={handleAddWidget}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {t.addWidget[lang]}
        </button>
      </div>

      {widgets.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          {t.noWidgets[lang]}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {widgets.map((widget) => {
            const Icon = widgetTypeIcons[widget.type] || Settings;
            return (
              <div
                key={widget.code}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {lang === 'ar' ? widget.name_ar : widget.name_en}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono">{widget.code}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    widget.is_active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {widget.is_active ? t.active[lang] : t.inactive[lang]}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  {t.widgetType[lang]}: {(t as any)[widget.type]?.[lang] || widget.type}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditWidget(widget)}
                    className="flex-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    {t.edit[lang]}
                  </button>
                  <button
                    onClick={() => handleDeleteWidget(widget)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderDashboardsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">{t.dashboards[lang]}</h3>
        <button
          onClick={handleAddLayout}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {t.addLayout[lang]}
        </button>
      </div>

      {layouts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          {t.noLayouts[lang]}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {layouts.map((layout) => (
            <div
              key={layout.code}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <LayoutDashboard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {lang === 'ar' ? layout.name_ar : layout.name_en}
                    </h4>
                    <p className="text-xs text-gray-500 font-mono">{layout.code}</p>
                  </div>
                </div>
                {layout.is_default && (
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full">
                    {t.default[lang]}
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-500 mb-3">
                {layout.widgets?.length || 0} {t.widgets[lang]}
                {layout.role && ` | ${t.layoutRole[lang]}: ${layout.role}`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditLayout(layout)}
                  className="flex-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                >
                  {t.edit[lang]}
                </button>
                <button
                  onClick={() => handleDeleteLayout(layout)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-purple-600" />
            {t.title[lang]}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle[lang]}</p>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1">
            {[
              { key: 'menus', label: t.menus, icon: MenuIcon },
              { key: 'widgets', label: t.widgets, icon: PieChart },
              { key: 'dashboards', label: t.dashboards, icon: LayoutDashboard },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label[lang]}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'menus' && renderMenusTab()}
            {activeTab === 'widgets' && renderWidgetsTab()}
            {activeTab === 'dashboards' && renderDashboardsTab()}
          </>
        )}
      </div>

      {/* Menu Editor Modal */}
      {showMenuEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.addMenu[lang]}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.menuCode[lang]}
                </label>
                <input
                  type="text"
                  value={menuFormData.code || ''}
                  onChange={(e) => setMenuFormData(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.menuName[lang]} (EN)
                  </label>
                  <input
                    type="text"
                    value={menuFormData.name_en || ''}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.menuName[lang]} (AR)
                  </label>
                  <input
                    type="text"
                    value={menuFormData.name_ar || ''}
                    onChange={(e) => setMenuFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    dir="rtl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.location[lang]}
                </label>
                <select
                  value={menuFormData.location || 'sidebar'}
                  onChange={(e) => setMenuFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                >
                  <option value="sidebar">{t.sidebar[lang]}</option>
                  <option value="header">{t.header[lang]}</option>
                  <option value="footer">{t.footer[lang]}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowMenuEditor(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleSaveMenu}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t.save[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Widget Editor Modal */}
      {showWidgetEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingWidget ? t.edit[lang] : t.addWidget[lang]}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.widgetCode[lang]}
                </label>
                <input
                  type="text"
                  value={widgetFormData.code || ''}
                  onChange={(e) => setWidgetFormData(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 font-mono"
                  disabled={!!editingWidget}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.widgetName[lang]} (EN)
                  </label>
                  <input
                    type="text"
                    value={widgetFormData.name_en || ''}
                    onChange={(e) => setWidgetFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.widgetName[lang]} (AR)
                  </label>
                  <input
                    type="text"
                    value={widgetFormData.name_ar || ''}
                    onChange={(e) => setWidgetFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    dir="rtl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.widgetType[lang]}
                </label>
                <select
                  value={widgetFormData.type || 'stat'}
                  onChange={(e) => setWidgetFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                >
                  <option value="stat">{t.stat[lang]}</option>
                  <option value="chart">{t.chart[lang]}</option>
                  <option value="table">{t.table[lang]}</option>
                  <option value="list">{t.list[lang]}</option>
                  <option value="calendar">{t.calendar[lang]}</option>
                  <option value="custom">{t.custom[lang]}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowWidgetEditor(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleSaveWidget}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t.save[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Editor Modal */}
      {showLayoutEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingLayout ? t.edit[lang] : t.addLayout[lang]}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.layoutCode[lang]}
                </label>
                <input
                  type="text"
                  value={layoutFormData.code || ''}
                  onChange={(e) => setLayoutFormData(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 font-mono"
                  disabled={!!editingLayout}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.layoutName[lang]} (EN)
                  </label>
                  <input
                    type="text"
                    value={layoutFormData.name_en || ''}
                    onChange={(e) => setLayoutFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.layoutName[lang]} (AR)
                  </label>
                  <input
                    type="text"
                    value={layoutFormData.name_ar || ''}
                    onChange={(e) => setLayoutFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layoutFormData.is_default ?? false}
                    onChange={(e) => setLayoutFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">{t.isDefault[lang]}</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.selectWidgets[lang]}
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-slate-600 rounded-lg">
                  {widgets.map((widget) => {
                    const isSelected = layoutFormData.widgets?.some(w => w.widget_code === widget.code);
                    return (
                      <label
                        key={widget.code}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                          isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLayoutFormData(prev => ({
                                ...prev,
                                widgets: [...(prev.widgets || []), { widget_code: widget.code, x: 0, y: 0, w: 1, h: 1 }]
                              }));
                            } else {
                              setLayoutFormData(prev => ({
                                ...prev,
                                widgets: prev.widgets?.filter(w => w.widget_code !== widget.code) || []
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{lang === 'ar' ? widget.name_ar : widget.name_en}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLayoutEditor(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleSaveLayout}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t.save[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message && (
        <div className={`fixed bottom-4 end-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}
    </div>
  );
};

export default MenuDashboardManager;
