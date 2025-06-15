import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppointments } from "@/hooks/useAppointments"
import { Appointment } from "@/types/appointment"
import { Calendar, Car, Clock, FileText, Search, User } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export const ViewAppointmentPage = () => {
  const [selectedDate, setSelectedDate] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  
  const { getAll } = useAppointments()

  const handleDateSearch = async () => {
    if (!selectedDate) {
      toast.error("Vælg en dato for at søge")
      return
    }

    setSearchLoading(true)
    try {
      const allAppointments = await getAll()
      
      if (allAppointments) {
        const filtered = allAppointments.filter(appointment => 
          appointment.date === selectedDate
        )
        
        setAppointments(filtered)
        
        if (filtered.length === 0) {
          toast.info("Ingen aftaler fundet for den valgte dato")
        } else {
          toast.success(`Fandt ${filtered.length} aftale(r) for ${new Date(selectedDate).toLocaleDateString('da-DK')}`)
        }
      }
    } catch (error) {
      toast.error("Fejl ved søgning efter aftaler")
    } finally {
      setSearchLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen px-4 pt-40">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Vis Aftaler
            </CardTitle>
            <CardDescription className="text-lg mt-4">
              Søg efter aftaler på en bestemt dato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Section */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Search className="h-5 w-5" />
                Søg efter dato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="searchDate">Vælg dato</Label>
                  <Input
                    id="searchDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    onClick={handleDateSearch}
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

            {/* Appointments List */}
            {appointments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Aftaler for {formatDate(selectedDate)} ({appointments.length})
                </h3>
                
                <div className="grid gap-4">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id} className="border border-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Customer Info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Kunde:</span>
                            </div>
                            <div className="ml-6 space-y-1">
                              <p className="font-medium">{appointment.customerName}</p>
                              <p className="text-sm text-muted-foreground">{appointment.address}</p>
                            </div>
                          </div>

                          {/* Car Info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Bil:</span>
                            </div>
                            <div className="ml-6 space-y-1">
                              <p className="font-medium">{appointment.carBrand} {appointment.carModel}</p>
                              <p className="text-sm text-muted-foreground">Nummerplade: {appointment.licensePlate}</p>
                            </div>
                          </div>
                        </div>

                        {/* Task Description */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="font-medium">Opgave:</span>
                              <p className="text-sm text-muted-foreground mt-1">{appointment.taskDescription}</p>
                            </div>
                          </div>
                        </div>

                        {/* Appointment ID */}
                        <div className="mt-2 text-right">
                          <span className="text-xs text-muted-foreground">Aftale ID: {appointment.id}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No results message */}
            {selectedDate && appointments.length === 0 && !searchLoading && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Ingen aftaler fundet for den valgte dato</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 