// ui-components.tsx

"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import * as SelectPrimitive from "@radix-ui/react-select"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/libs/utils"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react" // Importing icons for alerts

// ------------------- Button Component -------------------
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium t'ransition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-[#10275e] text-white bg-[#10275e]",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "bg-transparent hover:bg-muted-foreground",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-8 w-8 p-0",
        smIcon: "h-6 w-6 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// ------------------- Card Components -------------------
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
  )
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-muted-foreground ${className}`} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex items-center p-6 pt-0 ${className}`} {...props} />
}

// ------------------- Input Component -------------------
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// ------------------- Label Component -------------------
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  )
)
Label.displayName = "Label"

// ------------------- Progress Component -------------------
export interface ProgressProps extends React.ProgressHTMLAttributes<HTMLProgressElement> {
  value: number
}

export const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(
  ({ className, value, ...props }, ref) => (
    <progress
      ref={ref}
      className={`h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`}
      value={value}
      max={100}
      {...props}
    >
      {value}%
    </progress>
  )
)
Progress.displayName = "Progress"

// ------------------- Separator Component -------------------
export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>((props, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    className="my-4 h-px bg-muted"
    {...props}
  />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

// ------------------- Dropdown Menu Components -------------------
export const DropdownMenu = DropdownMenuPrimitive.Root

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Content
    ref={ref}
    className={cn(
      "min-w-[220px] rounded-md bg-white p-1 shadow-md",
      className
    )}
    {...props}
  />
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center rounded-sm px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

export const Select = SelectPrimitive.Root

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-lg text-black focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className
    )}
    {...props}
  />
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

export const SelectValue = SelectPrimitive.Value

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden rounded-md bg-white text-gray-700 shadow-md",
      className
    )}
    {...props}
  />
))
SelectContent.displayName = SelectPrimitive.Content.displayName

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1 text-sm focus:bg-gray-100",
      className
    )}
    {...props}
  />
))
SelectItem.displayName = SelectPrimitive.Item.displayName

// ------------------- Tabs Components -------------------

// Tabs Root Component
export const Tabs = TabsPrimitive.Root

// TabsList Component
export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex space-x-1 rounded-md bg-background p-1",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

// TabsTrigger Component
export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & VariantProps<typeof tabsTriggerVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      tabsTriggerVariants({ variant }),
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// Define variants for TabsTrigger using cva
const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all",
  {
    variants: {
      variant: {
        default: "text-muted-foreground hover:bg-muted",
        active: "bg-primary text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// TabsContent Component
export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 rounded-md bg-background p-4",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// ------------------- End of Tabs Components -------------------
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

// ------------------- Alert Components -------------------
const alertVariants = cva(
  "flex items-start space-x-3 p-4 border rounded-md",
  {
    variants: {
      variant: {
        success: "bg-green-50 border-green-400 text-green-700",
        error: "bg-red-50 border-red-400 text-red-700",
        warning: "bg-yellow-50 border-yellow-400 text-yellow-700",
        info: "bg-blue-50 border-blue-400 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, children, ...props }, ref) => {
    // Determine which icon to display based on variant
    const renderIcon = () => {
      switch (variant) {
        case "success":
          return <CheckCircle className="mt-1 flex-shrink-0 h-5 w-5 text-green-700" aria-hidden="true" />
        case "error":
          return <AlertCircle className="mt-1 flex-shrink-0 h-5 w-5 text-red-700" aria-hidden="true" />
        case "warning":
          return <AlertTriangle className="mt-1 flex-shrink-0 h-5 w-5 text-yellow-700" aria-hidden="true" />
        case "info":
        default:
          return <Info className="mt-1 flex-shrink-0 h-5 w-5 text-blue-700" aria-hidden="true" />
      }
    }

    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant }), className)}
        role="alert"
        {...props}
      >
        {renderIcon()}
        <div className="flex-1">
          {children}
        </div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

const alertDescriptionVariants = cva(
  "text-sm",
  {
    variants: {},
    defaultVariants: {},
  }
)

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertDescriptionVariants> {}

export const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(alertDescriptionVariants(), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AlertDescription.displayName = "AlertDescription"

// ------------------- End of Alert Components -------------------
