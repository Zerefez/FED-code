import { Button } from "@/components/ui/button"
import { HABIT_NOT_COMPLETED_REASONS, type HabitNotCompletedReason } from "@/services/habit-entry-service"
import { useState } from "react"

interface ReasonSelectorProps {
  habitName: string
  onReasonSelected: (reason: HabitNotCompletedReason) => void
  onCancel: () => void
  isLoading?: boolean
}

export function ReasonSelector({ habitName, onReasonSelected, onCancel, isLoading = false }: ReasonSelectorProps) {
  const [selectedReason, setSelectedReason] = useState<HabitNotCompletedReason | null>(null)

  const handleSubmit = () => {
    if (selectedReason) {
      onReasonSelected(selectedReason)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium">{habitName}</span> - Vælg årsag til at vanen ikke blev holdt i dag
      </p>
      
      <div className="space-y-3">
        {HABIT_NOT_COMPLETED_REASONS.map((reason) => (
          <button
            key={reason.value}
            onClick={() => setSelectedReason(reason.value)}
            className={`w-full p-3 text-left border rounded-lg transition-colors hover:bg-gray-50 ${
              selectedReason === reason.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedReason === reason.value
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedReason === reason.value && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <span className="font-medium">{reason.label}</span>
            </div>
          </button>
        ))}
        
        <div className="flex gap-2 mt-6">
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedReason || isLoading}
            className="flex-1"
          >
            {isLoading ? "Gemmer..." : "Bekræft"}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuller
          </Button>
        </div>
      </div>
    </div>
  )
} 