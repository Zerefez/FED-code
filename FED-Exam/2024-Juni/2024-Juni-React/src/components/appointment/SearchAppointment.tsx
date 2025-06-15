import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppointments } from "@/hooks/useAppointments"
import { Appointment } from "@/types/appointment"
import { Calendar, Clock, Search, User } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { EditAppointmentForm } from "./EditAppointmentForm"

type SearchType = "name" | "licensePlate"

export const SearchAppointment = () => {
  const [searchType, setSearchType] = useState<SearchType>("licensePlate")
  const [searchValue, setSearchValue] = useState("")
  const [foundAppointments, setFoundAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  
  const { getAll } = useAppointments()

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error("Indtast en søgeværdi")
      return
    }

    setSearchLoading(true)
    try {
      const allAppointments = await getAll()
      
      if (allAppointments) {
        const filtered = allAppointments.filter(appointment => {
          if (searchType === "name") {
            return appointment.customerName.toLowerCase().includes(searchValue.toLowerCase())
          } else {
            return appointment.licensePlate.toLowerCase().includes(searchValue.toLowerCase())
          }
        })
        
        setFoundAppointments(filtered)
        setSelectedAppointment(null)
        
        if (filtered.length === 0) {
          toast.info("Ingen aftaler fundet for søgningen")
        } else {
          toast.success(`Fandt ${filtered.length} aftale(r)`)
        }
      }
    } catch (error) {
      toast.error("Fejl ved søgning efter aftaler")
    } finally {
      setSearchLoading(false)
    }
  }

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
  }

  const handleAppointmentUpdated = (updatedAppointment: Appointment) => {
    // Update the appointment in the list
    setFoundAppointments(prev => 
      prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
    )
    setSelectedAppointment(updatedAppointment)
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="h-5 w-5" />
          Søg Efter Aftale
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="searchType">Søg efter</Label>
            <Select value={searchType} onValueChange={(value) => setSearchType(value as SearchType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="licensePlate">Nummerplade</SelectItem>
                <SelectItem value="name">Kundenavn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="searchValue">
              {searchType === "name" ? "Kundenavn" : "Nummerplade"}
            </Label>
            <Input
              id="searchValue"
              placeholder={searchType === "name" ? "f.eks. Anders And" : "f.eks. AL12345"}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              disabled={searchLoading}
              variant="outline"
              className="w-full"
            >
              {searchLoading ? <Clock className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Søg
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {foundAppointments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Fundne Aftaler ({foundAppointments.length})</h3>
          <div className="grid gap-3">
            {foundAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAppointment?.id === appointment.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleAppointmentSelect(appointment)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{appointment.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.carBrand} {appointment.carModel} - {appointment.licensePlate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(appointment.date).toLocaleDateString('da-DK')}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{appointment.taskDescription}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Form */}
      {selectedAppointment && (
        <div className="mt-8">
          <EditAppointmentForm
            appointment={selectedAppointment}
            onUpdate={handleAppointmentUpdated}
          />
        </div>
      )}
    </div>
  )
} 