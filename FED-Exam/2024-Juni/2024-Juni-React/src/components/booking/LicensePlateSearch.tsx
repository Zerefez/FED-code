import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Search } from "lucide-react"

interface LicensePlateSearchProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onLicensePlateChange?: () => void
  loading: boolean
  error?: string
}

export const LicensePlateSearch = ({ 
  value, 
  onChange, 
  onSearch,
  onLicensePlateChange,
  loading, 
  error 
}: LicensePlateSearchProps) => {
  
  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    if (onLicensePlateChange) onLicensePlateChange()
  }

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Search className="h-5 w-5" />
        Søg Efter Eksisterende Kunde
      </h3>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="py-3" htmlFor="licensePlate">Nummerplade</Label>
          <Input
            id="licensePlate"
            placeholder="f.eks. AL12345"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            className={error ? 'border-destructive' : ''}
          />
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            onClick={onSearch}
            disabled={loading}
            variant="outline"
          >
            {loading ? <Clock className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Søg
          </Button>
        </div>
      </div>
    </div>
  )
} 