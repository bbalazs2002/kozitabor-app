import * as Icons from 'lucide-react';
import { type LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  // Megkeressük az ikont a Lucide gyűjteményében a neve alapján
  const IconComponent = (Icons as any)[name];

  if (!IconComponent) {
    // Ha elírtad a nevet az adatbázisban, egy alapértelmezett ikont ad vissza
    return <Icons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
};

export default DynamicIcon;