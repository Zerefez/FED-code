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
import { cn } from "@/lib/utils"
import { loginUser, type LoginUserData } from "@/services"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState<LoginUserData>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Partial<LoginUserData>>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginUserData> = {}

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "E-mail er påkrævet"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail format er ugyldig"
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password er påkrævet"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof LoginUserData, value: string) => {
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
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const user = await loginUser(formData)
      
      if (user) {
        login(user)
        navigate('/app/dashboard')
      } else {
        setErrors({ email: "Ugyldige login oplysninger" })
      }
    } catch (error) {
      console.error('Login error:', error)
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
              
              <div className="flex flex-col gap-3 bg-accent-foreground rounded-md">
                <Button type="submit" className="w-full" disabled={isLoading}>
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
