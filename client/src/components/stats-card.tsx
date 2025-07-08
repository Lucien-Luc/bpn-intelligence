import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  subtitle?: string;
  progress?: number;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconColor,
  change,
  changeType,
  subtitle,
  progress,
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-[#a8cb63]";
      case "decrease":
        return "text-red-500";
      default:
        return "text-gray-600";
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return "fas fa-arrow-up";
      case "decrease":
        return "fas fa-arrow-down";
      default:
        return "fas fa-minus";
    }
  };

  return (
    <Card className="stats-card border border-gray-200 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`w-12 h-12 ${iconColor} bg-opacity-10 rounded-lg flex items-center justify-center`}>
            <i className={`${icon} ${iconColor}`}></i>
          </div>
        </div>
        
        {progress !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>{subtitle}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#a8cb63] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {change && (
          <div className="mt-4 flex items-center text-sm">
            <i className={`${getChangeIcon()} ${getChangeColor()} mr-1`}></i>
            <span className={getChangeColor()}>{change}</span>
            <span className="text-gray-600 ml-2">from last month</span>
          </div>
        )}
        
        {subtitle && progress === undefined && (
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
              <span>{subtitle}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
