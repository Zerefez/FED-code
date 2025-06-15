export interface Appointment {
  id?: number
  customerName: string
  address: string
  carBrand: string
  carModel: string
  licensePlate: string
  date: string
  taskDescription: string
}

export type CreateAppointmentData = Omit<Appointment, 'id'>
export type UpdateAppointmentData = Partial<CreateAppointmentData>

export type ServiceType = 'service' | 'repair' | 'inspection' 