import { appointmentService } from '@/services/appointment-service'
import { CreateAppointmentData, UpdateAppointmentData } from '@/types/appointment'
import { useState } from 'react'

export const useAppointments = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAsync = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await operation()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  const searchByLicensePlate = (licensePlate: string) =>
    handleAsync(() => appointmentService.getByLicensePlate(licensePlate))

  const create = (data: CreateAppointmentData) =>
    handleAsync(() => appointmentService.create(data))

  const update = (id: number, data: UpdateAppointmentData) =>
    handleAsync(() => appointmentService.update(id, data))

  const getAll = () =>
    handleAsync(() => appointmentService.getAll())

  return {
    loading,
    error,
    searchByLicensePlate,
    create,
    update,
    getAll
  }
} 