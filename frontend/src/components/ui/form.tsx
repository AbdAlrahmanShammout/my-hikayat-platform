import { Slot } from '@radix-ui/react-slot';
import { createContext, useContext, useId, type HTMLAttributes, type JSX, type ReactNode } from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/cn';

const Form = FormProvider;

const FormFieldContext = createContext<{ readonly name: string }>({ name: '' });
const FormItemContext = createContext<{ readonly id: string }>({ id: '' });

function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  props: ControllerProps<TFieldValues, TName>,
): JSX.Element {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function FormItem({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  const id: string = useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn('flex flex-col gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: HTMLAttributes<HTMLLabelElement>): JSX.Element {
  const field = useFormFieldIds();
  return (
    <Label
      className={cn(field.hasError ? 'text-destructive' : undefined, className)}
      htmlFor={field.formItemId}
      {...props}
    />
  );
}

function FormControl({ children }: { readonly children: ReactNode }): JSX.Element {
  const field = useFormFieldIds();
  return (
    <Slot
      id={field.formItemId}
      aria-describedby={
        field.hasError ? `${field.formDescriptionId} ${field.formMessageId}` : field.formDescriptionId
      }
      aria-invalid={field.hasError}
    >
      {children}
    </Slot>
  );
}

function FormDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>): JSX.Element {
  const field = useFormFieldIds();
  return (
    <p
      id={field.formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function FormMessage({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>): JSX.Element | null {
  const field = useFormFieldIds();
  const body: ReactNode = field.errorMessage ?? children;
  if (body === undefined || body === null || body === '') {
    return null;
  }
  return (
    <p id={field.formMessageId} className={cn('text-sm text-destructive', className)} {...props}>
      {body}
    </p>
  );
}

function useFormFieldIds(): {
  readonly formItemId: string;
  readonly formDescriptionId: string;
  readonly formMessageId: string;
  readonly hasError: boolean;
  readonly errorMessage: string | undefined;
} {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  const errorMessage: string | undefined =
    typeof fieldState.error?.message === 'string' ? fieldState.error.message : undefined;
  return {
    formItemId: `${itemContext.id}-form-item`,
    formDescriptionId: `${itemContext.id}-form-item-description`,
    formMessageId: `${itemContext.id}-form-item-message`,
    hasError: fieldState.error !== undefined,
    errorMessage,
  };
}

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage };
