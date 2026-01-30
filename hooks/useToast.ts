/**
 * Toast Notification Hook
 *
 * This module provides easy access to toast notifications across the app.
 * It re-exports everything from the ToastContext for convenient imports.
 *
 * @example Basic usage with hook
 * ```tsx
 * import { useToast } from '../hooks/useToast';
 *
 * function MyComponent() {
 *   const { success, error, warning, info } = useToast();
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       success('Data saved successfully!');
 *     } catch (err) {
 *       error('Failed to save data');
 *     }
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 *
 * @example Usage with options
 * ```tsx
 * const { success, error } = useToast();
 *
 * // With title
 * success('Your profile has been updated', { title: 'Profile Updated' });
 *
 * // With custom duration (10 seconds)
 * error('Connection lost', { duration: 10000 });
 *
 * // Persistent toast (won't auto-dismiss)
 * warning('Please review your changes', { duration: 0 });
 *
 * // Non-dismissible toast
 * info('Processing...', { dismissible: false });
 * ```
 *
 * @example Standalone usage (outside React components)
 * ```tsx
 * import { toast } from '../hooks/useToast';
 *
 * // In an API handler or utility function
 * export async function fetchData() {
 *   try {
 *     const data = await api.get('/data');
 *     toast.success('Data loaded');
 *     return data;
 *   } catch (err) {
 *     toast.error('Failed to load data');
 *     throw err;
 *   }
 * }
 * ```
 *
 * @example Programmatic dismissal
 * ```tsx
 * const { info, removeToast } = useToast();
 *
 * const handleUpload = async () => {
 *   // Show persistent loading toast
 *   const toastId = info('Uploading file...', { duration: 0, dismissible: false });
 *
 *   try {
 *     await uploadFile();
 *     removeToast(toastId); // Remove loading toast
 *     success('File uploaded successfully!');
 *   } catch (err) {
 *     removeToast(toastId);
 *     error('Upload failed');
 *   }
 * };
 * ```
 */

// Re-export everything from ToastContext
export {
  useToast,
  ToastProvider,
  ToastContext,
  toast,
  type ToastType,
  type ToastPosition,
  type ToastItem,
  type ToastOptions,
  type ToastContextType,
} from '../context/ToastContext';
