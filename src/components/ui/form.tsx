import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as FormPrimitive from "@radix-ui/react-form";
import { cn } from "../../lib/utils";

const Form = FormPrimitive.Root;

const FormField = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Field>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Field>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Field
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  />
));
FormField.displayName = FormPrimitive.Field.displayName;

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
FormLabel.displayName = LabelPrimitive.Root.displayName;

const FormControl = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Control>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Control>
>(({ ...props }, ref) => <FormPrimitive.Control ref={ref} {...props} />);
FormControl.displayName = FormPrimitive.Control.displayName;

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    match?: string[];
  }
>(({ className, children, match, ...props }, ref) => {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <FormPrimitive.Message match={match as any} asChild>
      <p
        ref={ref}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {children}
      </p>
    </FormPrimitive.Message>
  );
});
FormMessage.displayName = "FormMessage";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
};
