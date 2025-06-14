import { AuthNavigation } from "@/components/navigation"
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
import { cn } from "@/lib/utils"
import { UserService, type RegisterUserData } from "@/services"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState<RegisterUserData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Partial<RegisterUserData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  
  const navigate = useNavigate()

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Partial<RegisterUserData> = {}

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Fornavn er påkrævet"
    }

    // Validate last name  
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Efternavn er påkrævet"
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "E-mail er påkrævet"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail format er ugyldig"
    } else {
      // Check if email already exists
      try {
        const emailExists = await UserService.checkEmailExists(formData.email)
        if (emailExists) {
          newErrors.email = "E-mail er allerede registreret"
        }
      } catch (error) {
        console.error("Error checking email:", error)
      }
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password er påkrævet"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password skal være mindst 6 tegn"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof RegisterUserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("")
    
    setIsLoading(true)
    
    try {
      const isValid = await validateForm()
      
      if (!isValid) {
        setIsLoading(false)
        return
      }

      const newUser = await UserService.register(formData)
      console.log("User registered successfully:", newUser)
      
      setSuccessMessage("Bruger oprettet succesfuldt!")
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      })
      
      // Navigate to login page after successful registration
      setTimeout(() => {
        navigate('/auth/login')
      }, 2000)
      
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ email: "Der opstod en fejl under registrering. Prøv igen." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Opret bruger</CardTitle>
          <CardDescription>
            Udfyld formularen nedenfor for at oprette din bruger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {successMessage && (
                <div className="p-3 text-green-700 bg-green-100 border border-green-300 rounded-md">
                  {successMessage}
                </div>
              )}
              
              <div className="grid gap-3">
                <Label htmlFor="firstName">Fornavn</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Indtast dit fornavn"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500" : ""}
                  required
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="lastName">Efternavn</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Indtast dit efternavn"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500" : ""}
                  required
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Indtast dit password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex flex-col gap-3 bg-accent-foreground rounded-md">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Opretter bruger..." : "Opret bruger"}
                </Button>
              </div>
            </div>
            
            <AuthNavigation type="register" />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
