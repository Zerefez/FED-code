import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useForm, ValidationRules } from "@/hooks/use-form"
import { getTodayString } from "@/lib/date-utils"
import { FREQUENCY_OPTIONS } from "@/lib/frequency-utils"
import { CreateHabitData, HabitService } from "@/services/habit-service"
import React from "react"

interface AddHabitFormProps {
  onHabitAdded: () => void
  onCancel: () => void
}

interface HabitFormData {
  name: string;
  description: string;
  startDate: string;
  frequency: string;
}

export function AddHabitForm({ onHabitAdded, onCancel }: AddHabitFormProps) {
  const { user } = useAuth()
  
  const initialData: HabitFormData = {
    name: "",
    description: "",
    startDate: getTodayString(),
    frequency: "daily" // Default to daily
  }

  const validationRules: ValidationRules<HabitFormData> = {
    name: (value) => !value.trim() ? "Navn er påkrævet" : undefined,
    description: (value) => !value.trim() ? "Beskrivelse er påkrævet" : undefined,
    startDate: (value) => !value ? "Startdato er påkrævet" : undefined,
    frequency: (value) => !value ? "Frekvens er påkrævet" : undefined,
  }

  const {
    formData,
    errors,
    isLoading,
    setIsLoading,
    setErrors,
    handleInputChange,
    validateForm,
    resetForm
  } = useForm(initialData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      console.error("User not authenticated")
      return
    }
    
    setIsLoading(true)
    
    try {
      const isValid = validateForm(validationRules)
      
      if (!isValid) {
        setIsLoading(false)
        return
      }

      const habitData: CreateHabitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        frequency: formData.frequency,
        userId: user.id
      }

      await HabitService.create(habitData)
      
      // Reset form
      resetForm()
      
      // Call the callback to refresh the habits list and close the form
      onHabitAdded()
      
    } catch (error) {
      console.error("Error creating habit:", error)
      setErrors({ general: "Der opstod en fejl ved oprettelse af vane. Prøv igen." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tilføj ny vane</CardTitle>
        <CardDescription>
          Opret en ny vane med dit ønskede interval
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            {errors.general && (
              <div className="p-3 text-red-700 bg-red-100 border border-red-300 rounded-md">
                {errors.general}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="name">Navn på vane</Label>
              <Input
                id="name"
                type="text"
                placeholder="F.eks. Løbetur, Læsning, Meditation"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Beskrivelse</Label>
              <Input
                id="description"
                type="text"
                placeholder="F.eks. Løb 5 km, Læs i 30 minutter"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={errors.description ? "border-red-500" : ""}
                required
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Hvor ofte vil du udføre denne vane?</Label>
              <select
                id="frequency"
                value={formData.frequency}
                onChange={(e) => handleInputChange("frequency", e.target.value)}
                className={`w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.frequency ? "border-red-500" : ""
                }`}
                required
              >
                <option value="">Vælg frekvens</option>
                {FREQUENCY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
              {errors.frequency && (
                <p className="text-sm text-red-500">{errors.frequency}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startDate">Startdato</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className={errors.startDate ? "border-red-500" : ""}
                required
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Opretter..." : "Opret vane"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuller
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 