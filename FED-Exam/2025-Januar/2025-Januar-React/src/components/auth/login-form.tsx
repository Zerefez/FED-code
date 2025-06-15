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
import { useAuth } from "@/hooks/use-auth"
import { useForm, ValidationRules } from "@/hooks/use-form"
import { cn } from "@/lib/utils"
import { loginUser } from "@/services"
import React from "react"
import { useNavigate } from "react-router-dom"

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const initialData: LoginFormData = {
    email: "",
    password: "",
  }

  const { login } = useAuth()
  const navigate = useNavigate()

  const validationRules: ValidationRules<LoginFormData> = {
    email: (value) => !value.trim() ? "E-mail er påkrævet" : undefined,
    password: (value) => !value.trim() ? "Password er påkrævet" : undefined,
  }

  const {
    formData,
    errors,
    isLoading,
    setIsLoading,
    setErrors,
    handleInputChange,
    validateForm,
  } = useForm(initialData)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    
    try {
      const isValid = validateForm(validationRules)
      
      if (!isValid) {
        setIsLoading(false)
        return
      }

      const user = await loginUser(formData)
      
      if (user) {
        login(user)
        navigate('/app/dashboard')
      } else {
        setErrors({ email: "Ugyldig e-mail eller password" })
      }
      
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ email: "Der opstod en fejl under login. Prøv igen." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Log ind på din konto</CardTitle>
          <CardDescription>
            Indtast din e-mail og password for at logge ind
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {errors.general && (
                <div className="p-3 text-red-700 bg-red-100 border border-red-300 rounded-md">
                  {errors.general}
                </div>
              )}
              
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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
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
              
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading} variant="success">
                  {isLoading ? "Logger ind..." : "Log ind"}
                </Button>
              </div>
            </div>
            
            <AuthNavigation type="login" />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
