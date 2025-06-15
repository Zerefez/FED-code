import { BookingForm } from "@/components/booking"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceType } from "@/types/appointment"
import { Car } from "lucide-react"

interface BookingPageProps {
  serviceType?: ServiceType
}

const getServiceTitle = (serviceType?: ServiceType) => {
  const titles = {
    service: "Service & Olieskift",
    repair: "Reparér Bil",
    inspection: "Kontrol af Bil"
  }
  return titles[serviceType!] || "Book Ny Aftale"
}

export const BookingPage = ({ serviceType }: BookingPageProps) => {
  return (
    <div className="min-h-screen pt-40 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
              <Car className="h-8 w-8 text-primary" />
              {getServiceTitle(serviceType)}
            </CardTitle>
            <CardDescription className="text-lg mt-4">
              Udfyld formularen herunder for at booke en tid hos bilværkstedet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingForm serviceType={serviceType} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
