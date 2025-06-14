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
import { CreateHabitData, HabitService } from "@/services/habit-service"
import React, { useState } from "react"

interface AddHabitFormProps {
  onHabitAdded: () => void
  onCancel: () => void
}

export function AddHabitForm({ onHabitAdded, onCancel }: AddHabitFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().split('T')[0], // Today's date as default
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Navn er påkrævet"
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = "Beskrivelse er påkrævet"
    }

    // Validate start date
    if (!formData.startDate) {
      newErrors.startDate = "Startdato er påkrævet"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      console.error("User not authenticated")
      return
    }
    
    setIsLoading(true)
    
    try {
      const isValid = validateForm()
      
      if (!isValid) {
        setIsLoading(false)
        return
      }

      const habitData: CreateHabitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        frequency: "daily", // Set to daily as mentioned in requirements
        userId: user.id
      }

      await HabitService.create(habitData)
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        startDate: new Date().toISOString().split('T')[0],
      })
      
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
          Opret en ny vane som du vil spore dagligt
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