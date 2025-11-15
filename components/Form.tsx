'use client';

import { FieldRoot, FieldLabel, FieldErrorText, FieldHelperText } from '@chakra-ui/react';
import { forwardRef, ReactNode } from 'react';

// Re-export form components with v2-compatible names for easier migration
interface FormControlProps {
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  children?: ReactNode;
  [key: string]: any;
}

export const FormControl = forwardRef<HTMLDivElement, FormControlProps>((props, ref) => {
  const { isInvalid, isRequired, isDisabled, children, ...restProps } = props;
  return (
    <FieldRoot
      ref={ref}
      invalid={isInvalid}
      required={isRequired}
      disabled={isDisabled}
      {...restProps}
    >
      {children}
    </FieldRoot>
  );
});

FormControl.displayName = 'FormControl';

export const FormLabel = forwardRef<HTMLLabelElement, any>((props, ref) => {
  return <FieldLabel ref={ref} {...props} />;
});

FormLabel.displayName = 'FormLabel';

export const FormErrorMessage = forwardRef<HTMLDivElement, any>((props, ref) => {
  return <FieldErrorText ref={ref} {...props} />;
});

FormErrorMessage.displayName = 'FormErrorMessage';

export const FormHelperText = forwardRef<HTMLDivElement, any>((props, ref) => {
  return <FieldHelperText ref={ref} {...props} />;
});

FormHelperText.displayName = 'FormHelperText';

