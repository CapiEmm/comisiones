interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
}

export function MetricCard({ title, value, subtitle, icon, color = 'blue' }: MetricCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs opacity-60">{subtitle}</p>}
        </div>
        {icon && <div className="text-2xl opacity-70">{icon}</div>}
      </div>
    </div>
  )
}
