import * as React from "react";

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  currentValue?: string;
  onValueChange?: (value: string) => void;
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
  className?: string;
  currentValue?: string;
  onValueChange?: (value: string) => void;
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  className?: string;
  currentValue?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className, ...props }: TabsProps) {
  const [currentValue, setCurrentValue] = React.useState(value || defaultValue || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value);
    }
  }, [value]);

  const handleValueChange = (val: string) => {
    if (value === undefined) {
      setCurrentValue(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <div {...props} className={className}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        if (child.type === TabsList) {
          return React.cloneElement(child, { currentValue, onValueChange: handleValueChange });
        }
        if (child.type === TabsContent) {
          return React.cloneElement(child, { currentValue });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, currentValue, onValueChange, className, ...props }: TabsListProps) {
  return (
    <div {...props} className={className} role="tablist">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        if (child.type === TabsTrigger) {
          return React.cloneElement(child, { currentValue, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, currentValue, onValueChange, className, ...props }: TabsTriggerProps) {
  const isActive = currentValue === value;

  const handleClick = () => {
    if (onValueChange) {
      onValueChange(value);
    }
  };

  return (
    <button
      {...props}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      className={`${className} ${isActive ? "bg-[#333333] text-white" : "text-white"} cursor-pointer`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, currentValue, className, ...props }: TabsContentProps) {
  if (currentValue !== value) {
    return null;
  }
  return (
    <div {...props} role="tabpanel" className={className}>
      {children}
    </div>
  );
}
