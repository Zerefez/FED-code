import { DatePicker } from "@/components/booking/DatePicker"
import { FormSection } from "@/components/booking/FormSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppointments } from "@/hooks/useAppointments"
import { useForm } from "@/hooks/useForm"
import { Appointment, UpdateAppointmentData } from "@/types/appointment"
import { Calendar, Car, Clock, Save, User } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface EditAppointmentFormProps {
  appointment: Appointment
  onUpdate: (updatedAppointment: Appointment) => void
}

export const EditAppointmentForm = ({ appointment, onUpdate }: EditAppointmentFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const { update, loading, error } = useAppointments()
  
  const { formData, errors, handleInputChange, validateForm, setFormData } = useForm<UpdateAppointmentData>({
    customerName: appointment.customerName,
    address: appointment.address,
    carBrand: appointment.carBrand,
    carModel: appointment.carModel,
    licensePlate: appointment.licensePlate,
    date: appointment.date,
    taskDescription: appointment.taskDescription
  })

  const validationRules = {
    customerName: (value: string) => !value ? "Kundenavn er påkrævet" : undefined,
    address: (value: string) => !value ? "Adresse er påkrævet" : undefined,
    carBrand: (value: string) => !value ? "Bilmærke er påkrævet" : undefined,
    carModel: (value: string) => !value ? "Bilmodel er påkrævet" : undefined,
    licensePlate: (value: string) => !value ? "Nummerplade er påkrævet" : undefined,
    date: (value: string) => !value ? "Dato er påkrævet" : undefined,
    taskDescription: (value: string) => !value ? "Beskrivelse af opgave er påkrævet" : undefined,
  }

  // Initialize date picker with appointment date
  useEffect(() => {
    if (appointment.date) {
      setSelectedDate(new Date(appointment.date))
    }
  }, [appointment.date])

  // Update form data when appointment changes
  useEffect(() => {
    setFormData({
      customerName: appointment.customerName,
      address: appointment.address,
      carBrand: appointment.carBrand,
      carModel: appointment.carModel,
      licensePlate: appointment.licensePlate,
      date: appointment.date,
      taskDescription: appointment.taskDescription
    })
  }, [appointment, setFormData])

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    setFormData(prev => ({
      ...prev,
      date: date ? date.toISOString().split('T')[0] : ""
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(validationRules)) return
    
    if (!appointment.id) {
      toast.error("Kan ikke opdatere aftale uden ID")
      return
    }

    const result = await update(appointment.id, formData)
    if (result) {
      toast.success("Aftale opdateret succesfuldt!")
      onUpdate(result)
    }
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Save className="h-6 w-6 text-primary" />
          Rediger Aftale (ID: {appointment.id})
        </CardTitle>
        <CardDescription>
          Foretag ændringer til aftalen og klik "Opdater" for at gemme
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection
            title="Kundeoplysninger"
            icon={User}
            fields={[
              {
                id: "customerName",
                label: "Kundenavn",
                placeholder: "Indtast fulde navn",
                value: formData.customerName || "",
                onChange: (value) => handleInputChange('customerName', value),
                error: errors.customerName,
                required: true
              },
              {
                id: "address",
                label: "Adresse",
                placeholder: "Gade og nummer, postnr by",
                value: formData.address || "",
                onChange: (value) => handleInputChange('address', value),
                error: errors.address,
                required: true
              }
            ]}
          />

          <FormSection
            title="Biloplysninger"
            icon={Car}
            fields={[
              {
                id: "carBrand",
                label: "Bilmærke",
                placeholder: "f.eks. Ford, Toyota, BMW",
                value: formData.carBrand || "",
                onChange: (value) => handleInputChange('carBrand', value),
                error: errors.carBrand,
                required: true
              },
              {
                id: "carModel",
                label: "Bilmodel",
                placeholder: "f.eks. Focus, Corolla, X3",
                value: formData.carModel || "",
                onChange: (value) => handleInputChange('carModel', value),
                error: errors.carModel,
                required: true
              }
            ]}
          />

          <FormSection
            title="Nummerplade"
            icon={Car}
            columns={1}
            fields={[
              {
                id: "licensePlate",
                label: "Nummerplade",
                placeholder: "f.eks. AL12345",
                value: formData.licensePlate || "",
                onChange: (value) => handleInputChange('licensePlate', value),
                error: errors.licensePlate,
                required: true
              }
            ]}
          />

          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            error={errors.date}
          />

          <FormSection
            title="Opgave"
            icon={Car}
            columns={1}
            fields={[
              {
                id: "taskDescription",
                label: "Beskrivelse af opgave",
                placeholder: "Beskriv hvad der skal laves ved bilen",
                value: formData.taskDescription || "",
                onChange: (value) => handleInputChange('taskDescription', value),
                error: errors.taskDescription,
                required: true
              }
            ]}
          />

          <Button type="submit" disabled={loading} className="w-full text-lg py-6">
            {loading ? (
              <>
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                Opdaterer...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-5 w-5" />
                Opdater Aftale
              </>
            )}
          </Button>
          {error && <p className="text-sm text-destructive mt-2 text-center">{error}</p>}
        </form>
      </CardContent>
    </Card>
  )
} 