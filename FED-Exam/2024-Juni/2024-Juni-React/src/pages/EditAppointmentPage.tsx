import { SearchAppointment } from "@/components/appointment"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit } from "lucide-react"

export const EditAppointmentPage = () => {
  return (
    <div className="min-h-screen px-4 pt-40">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <Edit className="h-8 w-8 text-primary" />
              Ret Aftale
            </CardTitle>
            <CardDescription className="text-lg mt-4">
              Søg efter en eksisterende aftale og foretag ændringer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SearchAppointment />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 