import { useState, useEffect, useRef } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Center, GetCentersResponse } from "@/modules/shared/types"
import { displayDate } from "@/modules/shared/shared.utils"
import { sharedStorage } from "@/modules/shared/shared.storage"
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value"


export function CentersCombobox({ centers }: { centers: GetCentersResponse }) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { value: selectedCenter } = useStorageValue(sharedStorage.selectedCenter)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Use composedPath to handle shadow DOM boundaries
      const path = event.composedPath()
      const clickedInside = path.some(
        (node) => node === containerRef.current || node === dropdownRef.current
      )

      if (!clickedInside) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const filteredCenters = centers.filter((center) =>
    center.center_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectCenter = (center: Center) => {
    if (selectedCenter && selectedCenter.center_id === center.center_id) {
      sharedStorage.selectedCenter.setValue(null)
    } else {
      sharedStorage.selectedCenter.setValue(center)
    }
    setOpen(false)
    setSearchQuery("")
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="w-full flex flex-row justify-between items-center px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate">
          {selectedCenter ? selectedCenter.center_name : "Select center..."}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg" ref={dropdownRef}>
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search center..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Scrollable List */}
          <div className="max-h-[200px] overflow-y-auto">
            {filteredCenters.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No center found.
              </div>
            ) : (
              <ul className="py-1">
                {filteredCenters.map((center) => (
                  <li
                    key={center.center_id}
                    onClick={() => {
                      handleSelectCenter(center)
                      setOpen(false)
                      setSearchQuery("")
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex flex-row justify-between items-center"
                  >
                    <span className="flex flex-col">
                        <span>{center.center_name}</span>
                        <span className="text-xs text-muted-foreground">Created: {displayDate(center.created_at)}</span>
                    </span>
                    <Check
                      className={cn(
                        "h-4 w-4 ml-2 flex-shrink-0",
                        selectedCenter && selectedCenter.center_id === center.center_id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
