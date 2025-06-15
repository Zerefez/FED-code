import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon } from "lucide-react"
import { useState } from "react"

interface DatePickerProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  error?: string
}

export const DatePicker = ({ value, onChange, error }: DatePickerProps) => {
  const [showCalendar, setShowCalendar] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    onChange(date)
    setShowCalendar(false)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CalendarIcon className="h-5 w-5" />
        Ønsket Dato
      </h3>
      <div>
        <Label className="pb-3" htmlFor="date">Vælg dato *</Label>
        <div className="relative">
          <Input
            id="date"
            placeholder="Klik for at vælge dato"
            value={value ? value.toLocaleDateString('da-DK') : ''}
            onClick={() => setShowCalendar(!showCalendar)}
            readOnly
            className={`cursor-pointer ${error ? 'border-destructive' : ''}`}
          />
          <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        {showCalendar && (
          <div className="absolute z-50 mt-1 p-3 bg-popover border border-border rounded-md shadow-lg">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </div>
        )}
        
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    </div>
  )
} 