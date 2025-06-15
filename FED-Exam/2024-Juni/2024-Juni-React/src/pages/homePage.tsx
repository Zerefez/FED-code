import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Car, Clock, MapPin, Phone, Settings, Shield, Star, Users, Wrench } from "lucide-react"
import { Link } from "react-router"

export const HomePage = () => {
  const services = [
    {
      icon: Settings,
      title: "Service & Olieskift",
      description: "Komplet service af din bil inklusiv olieskift og kontrol af alle væsker"
    },
    {
      icon: Car,
      title: "Dækskift",
      description: "Skift mellem sommer- og vinterdæk samt montering af nye dæk"
    },
    {
      icon: Wrench,
      title: "Reparationer",
      description: "Professionelle reparationer af motor, bremser, transmission og mere"
    },
    {
      icon: Shield,
      title: "Syn & Kontrol",
      description: "Periodisk syn og sikkerhedskontrol af dit køretøj"
    }
  ]

  const features = [
    {
      icon: Clock,
      title: "Hurtig Service",
      description: "Vi respekterer din tid og leverer hurtig, professionel service"
    },
    {
      icon: Users,
      title: "Erfarne Mekanikere",
      description: "Vores team har mange års erfaring med alle bilmærker"
    },
    {
      icon: Star,
      title: "Kvalitetsgaranti",
      description: "Vi står bag vores arbejde med fuld garanti på alle ydelser"
    }
  ]
    
  return (
    <div className="min-h-screen">
        {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 pt-40 pb-10">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Professionelt <span className="text-primary">Bilværksted</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Vi registrerer og udfører alle typer bilservice - fra almindelig vedligeholdelse til komplekse reparationer
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/book">
                  <Calendar className="mr-2 h-5 w-5"  />
                  Book ny aftale
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Phone className="mr-2 h-5 w-5" />
                Ring til Os
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Vores Tjenester
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vi tilbyder et bredt udvalg af professionelle biltjenester til alle bilmærker
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hvorfor Vælge Os?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vi er dit lokale bilværksted med fokus på kvalitet, service og kundetilfredshed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconComponent className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Service Registration Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
                Registrer Din Bilservice
              </CardTitle>
              <CardDescription className="text-lg mt-4">
                Fortæl os hvad du ønsker at få lavet ved din bil, så klarer vi resten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-10 items-center justify-end">
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-foreground">Almindelige Services:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Årlig service og olieskift
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Skift af sommer-/vinterdæk
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Montering af nye dæk
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Bremseservice og -reparation
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-foreground">Reparationer:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Motor- og transmissionsreparationer
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Elektriske systemfejl
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Aircondition og klimaanlæg
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      Udstødningssystem
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center pt-6">
                <Button asChild size="lg" className="text-lg px-12 py-6">
                  <Link to="/book">
                    <Calendar className="mr-2 h-5 w-5" />
                    Start Registrering
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Kontakt Os
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Ring til Os</h3>
              <p className="text-muted-foreground">+45 12 34 56 78</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Besøg Os</h3>
              <p className="text-muted-foreground">Bilværkstedsvej 123<br />8000 Aarhus C</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Åbningstider</h3>
              <p className="text-muted-foreground">Man-Fre: 08:00-17:00<br />Lør: 09:00-14:00</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}