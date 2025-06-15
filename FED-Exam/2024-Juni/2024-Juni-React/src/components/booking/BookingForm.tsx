import { Button } from "@/components/ui/button"
import { useAppointments } from "@/hooks/useAppointments"
import { useForm } from "@/hooks/useForm"
import { CreateAppointmentData, ServiceType } from "@/types/appointment"
import { Calendar, Car, Clock, User } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { DatePicker } from "./DatePicker"
import { FormSection } from "./FormSection"
import { LicensePlateSearch } from "./LicensePlateSearch"

interface BookingFormProps {
  serviceType?: ServiceType
}

const getServiceDescription = (serviceType?: ServiceType) => {
  const descriptions = {
    service: "Årlig service + olieskift",
    repair: "Reparation af bil", 
    inspection: "Periodisk kontrol og syn"
  }
  return descriptions[serviceType!] || ""
}

export const BookingForm = ({ serviceType }: BookingFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [searchLoading, setSearchLoading] = useState(false)
  const { searchByLicensePlate, create, loading, error } = useAppointments()
  
  const { formData, errors, handleInputChange, validateForm, setFormData, setErrors } = useForm<CreateAppointmentData>({
    customerName: "",
    address: "",
    carBrand: "",
    carModel: "",
    licensePlate: "",
    date: "",
    taskDescription: getServiceDescription(serviceType)
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

  const clearAutoFill = () => {
    setFormData(prev => ({
      ...prev,
      customerName: "",
      address: "",
      carBrand: "",
      carModel: ""
    }))
  }

  const handleSearch = async () => {
    if (!formData.licensePlate.trim()) {
      setErrors(prev => ({ ...prev, licensePlate: "Indtast nummerplade for at søge" }))
      return
    }

    setErrors(prev => ({ ...prev, licensePlate: "" }))
    clearAutoFill()
    setSearchLoading(true)

    try {
      const appointments = await searchByLicensePlate(formData.licensePlate)
      
      if (appointments && Array.isArray(appointments) && appointments.length > 0) {
        const lastAppointment = appointments[appointments.length - 1]
        setFormData(prev => ({
          ...prev,
          customerName: lastAppointment.customerName || "",
          address: lastAppointment.address || "",
          carBrand: lastAppointment.carBrand || "",
          carModel: lastAppointment.carModel || ""
        }))
        toast.success("Kundeoplysninger fundet og udfyldt automatisk")
      } else {
        toast.info("Ingen tidligere aftaler fundet for denne nummerplade")
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, licensePlate: "Fejl ved søgning. Prøv igen." }))
      toast.error("Fejl ved søgning efter kunde")
    } finally {
      setSearchLoading(false)
    }
  }

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
    
    const result = await create(formData)
    if (result) {
      toast.success("Aftale oprettet! Vi kontakter dig snarest for at bekræfte tiden.")
      // Reset form
      setFormData({
        customerName: "",
        address: "",
        carBrand: "",
        carModel: "",
        licensePlate: "",
        date: "",
        taskDescription: getServiceDescription(serviceType)
      })
      setSelectedDate(undefined)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <LicensePlateSearch
        value={formData.licensePlate}
        onChange={(value) => handleInputChange('licensePlate', value)}
        onSearch={handleSearch}
        onLicensePlateChange={clearAutoFill}
        loading={searchLoading}
        error={errors.licensePlate}
      />

      <FormSection
        title="Kundeoplysninger"
        icon={User}
        fields={[
          {
            id: "customerName",
            label: "Kundenavn",
            placeholder: "Indtast fulde navn",
            value: formData.customerName,
            onChange: (value) => handleInputChange('customerName', value),
            error: errors.customerName,
            required: true
          },
          {
            id: "address",
            label: "Adresse",
            placeholder: "Gade og nummer, postnr by",
            value: formData.address,
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
            value: formData.carBrand,
            onChange: (value) => handleInputChange('carBrand', value),
            error: errors.carBrand,
            required: true
          },
          {
            id: "carModel",
            label: "Bilmodel",
            placeholder: "f.eks. Focus, Corolla, X3",
            value: formData.carModel,
            onChange: (value) => handleInputChange('carModel', value),
            error: errors.carModel,
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
            value: formData.taskDescription,
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
            Opretter aftale...
          </>
        ) : (
          <>
            <Calendar className="mr-2 h-5 w-5" />
            Book Tid
          </>
        )}
      </Button>
      {error && <p className="text-sm text-destructive mt-2 text-center">{error}</p>}
    </form>
  )
} 