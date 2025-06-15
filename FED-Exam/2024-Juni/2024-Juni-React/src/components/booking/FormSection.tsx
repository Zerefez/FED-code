import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LucideIcon } from "lucide-react"

interface FormField {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

interface FormSectionProps {
  title: string
  icon: LucideIcon
  fields: FormField[]
  columns?: 1 | 2
}

export const FormSection = ({ title, icon: Icon, fields, columns = 2 }: FormSectionProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      <Icon className="h-5 w-5" />
      {title}
    </h3>
    <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
      {fields.map(({ id, label, placeholder, value, onChange, error, required }) => (
        <div  key={id}>
          <Label className="pb-3" htmlFor={id}>{label}{required && ' *'}</Label>
          <Input
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-destructive' : ''}
          />
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
      ))}
    </div>
  </div>
) 