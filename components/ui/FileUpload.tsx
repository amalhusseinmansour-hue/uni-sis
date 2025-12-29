import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  File,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Trash2,
} from 'lucide-react';

type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: FileStatus;
  error?: string;
  url?: string;
}

interface FileUploadProps {
  lang?: 'en' | 'ar';
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  disabled?: boolean;
  onUpload?: (files: File[]) => Promise<void>;
  onChange?: (files: File[]) => void;
  value?: File[];
  className?: string;
}

const t = {
  dragDrop: { en: 'Drag and drop files here', ar: 'اسحب وأفلت الملفات هنا' },
  or: { en: 'or', ar: 'أو' },
  browse: { en: 'Browse Files', ar: 'تصفح الملفات' },
  maxSize: { en: 'Max file size:', ar: 'الحجم الأقصى:' },
  formats: { en: 'Supported formats:', ar: 'الصيغ المدعومة:' },
  uploading: { en: 'Uploading...', ar: 'جاري الرفع...' },
  uploaded: { en: 'Uploaded', ar: 'تم الرفع' },
  failed: { en: 'Upload failed', ar: 'فشل الرفع' },
  remove: { en: 'Remove', ar: 'إزالة' },
  retry: { en: 'Retry', ar: 'إعادة المحاولة' },
  tooLarge: { en: 'File is too large', ar: 'الملف كبير جداً' },
  tooMany: { en: 'Too many files', ar: 'عدد الملفات كثير' },
  invalidType: { en: 'Invalid file type', ar: 'نوع ملف غير صالح' },
};

const getFileIcon = (file: File) => {
  const type = file.type;
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return Archive;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const FileUpload: React.FC<FileUploadProps> = ({
  lang = 'en',
  accept,
  multiple = true,
  maxSize = 10,
  maxFiles = 5,
  disabled = false,
  onUpload,
  onChange,
  value,
  className = '',
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRTL = lang === 'ar';

  const processFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      // Check max files
      if (files.length + validFiles.length >= maxFiles) {
        continue;
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          progress: 0,
          status: 'error',
          error: t.tooLarge[lang],
        });
        continue;
      }

      validFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending',
      });
    }

    setFiles((prev) => [...prev, ...validFiles]);
    onChange?.(validFiles.filter((f) => f.status !== 'error').map((f) => f.file));

    // Auto upload if handler provided
    if (onUpload) {
      for (const uploadFile of validFiles) {
        if (uploadFile.status === 'error') continue;

        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading' } : f))
        );

        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          );
        }, 100);

        try {
          await onUpload([uploadFile.file]);
          clearInterval(progressInterval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, progress: 100, status: 'success' } : f
            )
          );
        } catch (error) {
          clearInterval(progressInterval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, status: 'error', error: t.failed[lang] } : f
            )
          );
        }
      }
    }
  }, [files.length, maxFiles, maxSize, lang, onUpload, onChange]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const retryUpload = async (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file && onUpload) {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'uploading', progress: 0, error: undefined } : f))
      );

      try {
        await onUpload([file.file]);
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: 100, status: 'success' } : f))
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: 'error', error: t.failed[lang] } : f))
        );
      }
    }
  };

  return (
    <div className={className} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
        <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
        <p className="text-slate-600 font-medium mb-1">{t.dragDrop[lang]}</p>
        <p className="text-slate-400 text-sm mb-3">{t.or[lang]}</p>
        <button
          type="button"
          disabled={disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {t.browse[lang]}
        </button>
        <div className="mt-4 text-xs text-slate-400 space-y-1">
          <p>{t.maxSize[lang]} {maxSize}MB</p>
          {accept && <p>{t.formats[lang]} {accept}</p>}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((uploadedFile) => {
            const FileIcon = getFileIcon(uploadedFile.file);
            return (
              <div
                key={uploadedFile.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <FileIcon className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">
                      {formatFileSize(uploadedFile.file.size)}
                    </span>
                    {uploadedFile.status === 'uploading' && (
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${uploadedFile.progress}%` }}
                        />
                      </div>
                    )}
                    {uploadedFile.status === 'error' && (
                      <span className="text-xs text-red-500">{uploadedFile.error}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {uploadedFile.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                  {uploadedFile.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {uploadedFile.status === 'error' && (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <button
                        onClick={() => retryUpload(uploadedFile.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {t.retry[lang]}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Image Upload with Preview
interface ImageUploadProps {
  lang?: 'en' | 'ar';
  value?: string;
  onChange?: (file: File | null) => void;
  onUpload?: (file: File) => Promise<string>;
  aspectRatio?: number;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  lang = 'en',
  value,
  onChange,
  onUpload,
  aspectRatio = 1,
  maxSize = 5,
  disabled = false,
  className = '',
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRTL = lang === 'ar';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size
    if (file.size > maxSize * 1024 * 1024) {
      alert(t.tooLarge[lang]);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    onChange?.(file);

    // Upload if handler provided
    if (onUpload) {
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        setPreview(url);
      } catch (error) {
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = () => {
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={className} dir={isRTL ? 'rtl' : 'ltr'}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-xl object-cover"
            style={{ aspectRatio }}
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
          {!isUploading && !disabled && (
            <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                className="p-2 bg-white rounded-lg hover:bg-slate-100"
              >
                <Upload className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={removeImage}
                className="p-2 bg-white rounded-lg hover:bg-slate-100"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={`
            w-full border-2 border-dashed border-slate-300 rounded-xl
            flex flex-col items-center justify-center p-8
            hover:border-slate-400 transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{ aspectRatio }}
        >
          <Image className="w-10 h-10 text-slate-400 mb-2" />
          <span className="text-sm text-slate-500">
            {lang === 'en' ? 'Click to upload image' : 'اضغط لرفع صورة'}
          </span>
        </button>
      )}
    </div>
  );
};

// Avatar Upload
interface AvatarUploadProps {
  lang?: 'en' | 'ar';
  value?: string;
  name?: string;
  size?: number;
  onChange?: (file: File) => void;
  onUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  lang = 'en',
  value,
  name,
  size = 120,
  onChange,
  onUpload,
  disabled = false,
  className = '',
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    onChange?.(file);

    if (onUpload) {
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        setPreview(url);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />
      <div
        style={{ width: size, height: size }}
        className="relative rounded-full overflow-hidden group cursor-pointer"
        onClick={() => !disabled && inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : name ? (
          <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium">
            {getInitials(name)}
          </div>
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <Image className="w-8 h-8 text-slate-400" />
          </div>
        )}

        {/* Overlay */}
        {!disabled && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-white" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
