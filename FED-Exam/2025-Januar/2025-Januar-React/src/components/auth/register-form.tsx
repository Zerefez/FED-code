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
import { useForm, ValidationRules } from "@/hooks/use-form"
import { cn } from "@/lib/utils"
import { UserService, type RegisterUserData } from "@/services"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()

  const initialData: RegisterUserData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  }

  const validationRules: ValidationRules<RegisterUserData> = {
    firstName: (value) => !value.trim() ? "Fornavn er påkrævet" : undefined,
    lastName: (value) => !value.trim() ? "Efternavn er påkrævet" : undefined,
    email: (value) => {
      if (!value.trim()) return "E-mail er påkrævet";
      if (!/\S+@\S+\.\S+/.test(value)) return "E-mail format er ugyldig";
      return undefined;
    },
    password: (value) => {
      if (!value) return "Password er påkrævet";
      if (value.length < 6) return "Password skal være mindst 6 tegn";
      return undefined;
    }
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
    setSuccessMessage("")
    
    setIsLoading(true)
    
    try {
      const isValid = validateForm(validationRules)
      
      if (!isValid) {
        setIsLoading(false)
        return
      }

      // Check if email already exists
      try {
        const emailExists = await UserService.checkEmailExists(formData.email)
        if (emailExists) {
          setErrors({ email: "E-mail er allerede registreret" })
          setIsLoading(false)
          return
        }
      } catch (error) {
        console.error("Error checking email:", error)
      }

      const newUser = await UserService.register(formData)
      console.log("User registered successfully:", newUser)
      
      setSuccessMessage("Bruger oprettet succesfuldt!")
      
      // Reset form
      resetForm()
      
      // Navigate to login page after successful registration
      setTimeout(() => {
        navigate('/auth/login')
      }, 2000)
      
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ general: "Der opstod en fejl under registrering. Prøv igen." })
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

              {errors.general && (
                <div className="p-3 text-red-700 bg-red-100 border border-red-300 rounded-md">
                  {errors.general}
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
