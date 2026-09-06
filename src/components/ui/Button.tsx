import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium font-sans rounded-xl transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

  const variantStyles = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]",
    secondary: "bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white border border-white/[0.08] hover:border-white/[0.15]",
    ghost: "text-slate-400 hover:text-white hover:bg-white/[0.05]",
    outline: "border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:bg-cyan-950/40",
    danger: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
  };

  const sizeStyles = {
    xs: "text-[11px] px-2.5 py-1 gap-1.5 rounded-lg",
    sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
    md: "text-xs font-semibold px-4 py-2 gap-2 rounded-xl",
    lg: "text-sm font-semibold px-5 py-2.5 gap-2.5 rounded-xl"
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
