import React from 'react';
import { User } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'none';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  rounded?: boolean;
  bordered?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; status: string; icon: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', status: 'w-1.5 h-1.5 border', icon: 'w-3 h-3' },
  sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2 h-2 border', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', text: 'text-sm', status: 'w-2.5 h-2.5 border-2', icon: 'w-5 h-5' },
  lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3 h-3 border-2', icon: 'w-6 h-6' },
  xl: { container: 'w-16 h-16', text: 'text-xl', status: 'w-4 h-4 border-2', icon: 'w-8 h-8' },
  '2xl': { container: 'w-24 h-24', text: 'text-3xl', status: 'w-5 h-5 border-2', icon: 'w-12 h-12' },
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-slate-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  none: '',
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getColorFromName = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-rose-500',
    'bg-amber-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name,
  size = 'md',
  status = 'none',
  rounded = true,
  bordered = false,
  className = '',
  onClick,
}) => {
  const sizeClass = sizeClasses[size];
  const [imageError, setImageError] = React.useState(false);

  const showImage = src && !imageError;
  const showInitials = !showImage && name;
  const showIcon = !showImage && !name;

  return (
    <div
      className={`
        relative inline-flex items-center justify-center flex-shrink-0
        ${sizeClass.container}
        ${rounded ? 'rounded-full' : 'rounded-lg'}
        ${bordered ? 'ring-2 ring-white shadow-sm' : ''}
        ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {showImage && (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover ${rounded ? 'rounded-full' : 'rounded-lg'}`}
        />
      )}
      {showInitials && (
        <div
          className={`
            w-full h-full flex items-center justify-center
            ${getColorFromName(name)} text-white font-medium
            ${sizeClass.text}
            ${rounded ? 'rounded-full' : 'rounded-lg'}
          `}
        >
          {getInitials(name)}
        </div>
      )}
      {showIcon && (
        <div
          className={`
            w-full h-full flex items-center justify-center
            bg-slate-200 text-slate-500
            ${rounded ? 'rounded-full' : 'rounded-lg'}
          `}
        >
          <User className={sizeClass.icon} />
        </div>
      )}
      {status !== 'none' && (
        <span
          className={`
            absolute bottom-0 end-0
            ${sizeClass.status}
            ${statusColors[status]}
            rounded-full border-white
          `}
        />
      )}
    </div>
  );
};

// Avatar Group
interface AvatarGroupProps {
  avatars: Array<{ src?: string; name?: string; alt?: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  className = '',
}) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const sizeClass = sizeClasses[size];

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visible.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          size={size}
          bordered
        />
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${sizeClass.container}
            flex items-center justify-center
            bg-slate-100 text-slate-600 font-medium
            ${sizeClass.text}
            rounded-full ring-2 ring-white
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

// Avatar with Name
interface AvatarWithNameProps extends AvatarProps {
  subtitle?: string;
  nameClassName?: string;
  subtitleClassName?: string;
  reverse?: boolean;
}

export const AvatarWithName: React.FC<AvatarWithNameProps> = ({
  name,
  subtitle,
  nameClassName = '',
  subtitleClassName = '',
  reverse = false,
  ...avatarProps
}) => {
  return (
    <div className={`flex items-center gap-3 ${reverse ? 'flex-row-reverse' : ''}`}>
      <Avatar name={name} {...avatarProps} />
      <div className={reverse ? 'text-end' : ''}>
        {name && (
          <p className={`font-medium text-slate-800 ${nameClassName}`}>{name}</p>
        )}
        {subtitle && (
          <p className={`text-sm text-slate-500 ${subtitleClassName}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

// Editable Avatar
interface EditableAvatarProps extends AvatarProps {
  onEdit?: () => void;
  editLabel?: string;
}

export const EditableAvatar: React.FC<EditableAvatarProps> = ({
  onEdit,
  editLabel = 'Edit',
  size = 'xl',
  ...avatarProps
}) => {
  return (
    <div className="relative inline-block group">
      <Avatar size={size} {...avatarProps} />
      {onEdit && (
        <button
          onClick={onEdit}
          className="
            absolute inset-0 flex items-center justify-center
            bg-black/50 text-white text-sm font-medium
            opacity-0 group-hover:opacity-100 transition-opacity
            rounded-full
          "
        >
          {editLabel}
        </button>
      )}
    </div>
  );
};

export default Avatar;
