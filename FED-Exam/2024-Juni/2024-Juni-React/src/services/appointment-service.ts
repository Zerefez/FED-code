import { Appointment, CreateAppointmentData, UpdateAppointmentData } from '@/types/appointment'
import { apiClient } from './api-client'

class AppointmentService {
  private endpoint = '/appointments'

  async getAll(): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>(this.endpoint)
  }

  async getById(id: number): Promise<Appointment> {
    return apiClient.get<Appointment>(`${this.endpoint}/${id}`)
  }

  async getByLicensePlate(licensePlate: string): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>(this.endpoint, { licensePlate })
  }

  async create(data: CreateAppointmentData): Promise<Appointment> {
    return apiClient.post<Appointment>(this.endpoint, data)
  }

  async update(id: number, data: UpdateAppointmentData): Promise<Appointment> {
    return apiClient.put<Appointment>(`${this.endpoint}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.endpoint}/${id}`)
  }
}

export const appointmentService = new AppointmentService() 