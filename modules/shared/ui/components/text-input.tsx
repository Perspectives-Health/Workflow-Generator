import * as React from 'react';

export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ type, onFocus, onKeyDown, ...props }, ref) => {

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.stopPropagation();
        onKeyDown?.(event);
    }

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        event.stopPropagation();
        onFocus?.(event);
    }

  return <input 
  type={type}
  ref={ref}
  onKeyDown={handleKeyDown}
  onFocus={handleFocus}
  {...props}
  />;
});

TextInput.displayName = 'TextInput';