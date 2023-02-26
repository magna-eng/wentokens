import { ReactNode, ComponentProps } from "react";
import { tw } from "typewind";

type IButtonProps = {
  isOutline?: boolean
  children: ReactNode;
  className?: string;
} & ComponentProps<"button">

export default function Button({ children, className, isOutline, ...props }: IButtonProps) {
  let baseButtonClasses: string = tw.btn.btn_primary.text_primary.backdrop_blur.w_full
  if (isOutline) baseButtonClasses += ` ${tw.btn_outline}`
  return <button
    {...props} 
    className={`${baseButtonClasses} ${className || ''} bg-primary/[.12] hover:bg-primary/[.24] active:bg-primary/[.32]`
}>
    {children}
  </button>
}
