import { useState, useEffect, useRef } from "react"
import { Check, ChevronsUpDown, Building2, Building } from "lucide-react"
import { cn } from "@/lib/utils"
import { Center, EnterpriseDetailsResponse, GetCentersResponse } from "@/modules/shared/types"
import { displayDate } from "@/modules/shared/shared.utils"
import { sharedStorage } from "@/modules/shared/shared.storage"
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value"
import { TextInput } from "@/modules/shared/ui/components/text-input"

type ListItem = 
  | { type: 'center'; data: Center }
  | { type: 'enterprise'; data: EnterpriseDetailsResponse }

export function CentersCombobox({ centers, enterprises }: { centers: GetCentersResponse, enterprises: EnterpriseDetailsResponse[] }) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { value: selectedCenter } = useStorageValue(sharedStorage.selectedCenter)
  const { value: selectedEnterprise } = useStorageValue(sharedStorage.selectedEnterprise)

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

  // Combine centers and enterprises into a single list
  const combinedList: ListItem[] = [
    ...(enterprises ?? []).map((enterprise): ListItem => ({ type: 'enterprise', data: enterprise })),
    ...(centers ?? []).map((center): ListItem => ({ type: 'center', data: center })),
  ]

  // Filter by search query
  const filteredList = combinedList.filter((item) => {
    const name = item.type === 'center' 
      ? item.data.center_name 
      : item.data.name ?? ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleSelectItem = (item: ListItem) => {
    if (item.type === 'center') {
      const center = item.data
      if (selectedCenter && selectedCenter.center_id === center.center_id) {
        sharedStorage.selectedCenter.setValue(null)
      } else {
        sharedStorage.selectedCenter.setValue(center)
        sharedStorage.selectedEnterprise.setValue(null)
      }
    } else {
      const enterprise = item.data
      if (selectedEnterprise && selectedEnterprise.id === enterprise.id) {
        sharedStorage.selectedEnterprise.setValue(null)
      } else {
        sharedStorage.selectedEnterprise.setValue({ id: enterprise.id, name: enterprise.name ?? '' })
        sharedStorage.selectedCenter.setValue(null)
      }
    }
    setOpen(false)
    setSearchQuery("")
  }

  const getDisplayText = () => {
    if (selectedCenter) return selectedCenter.center_name
    if (selectedEnterprise) return selectedEnterprise.name
    return "Select center or enterprise..."
  }

  const isItemSelected = (item: ListItem): boolean => {
    if (item.type === 'center') {
      return selectedCenter?.center_id === item.data.center_id
    } else {
      return selectedEnterprise?.id === item.data.id
    }
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
          {getDisplayText()}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg" ref={dropdownRef}>
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <TextInput
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Scrollable List */}
          <div className="max-h-[200px] overflow-y-auto">
            {filteredList.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No results found.
              </div>
            ) : (
              <ul className="py-1">
                {filteredList.map((item) => {
                  const key = item.type === 'center' 
                    ? `center-${item.data.center_id}` 
                    : `enterprise-${item.data.id}`
                  const name = item.type === 'center' 
                    ? item.data.center_name 
                    : item.data.name ?? 'Unnamed'
                  const subtitle = item.type === 'center'
                    ? `Created: ${displayDate(item.data.created_at)}`
                    : 'Enterprise'

                  return (
                    <li
                      key={key}
                      onClick={() => handleSelectItem(item)}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex flex-row justify-between items-center"
                    >
                      <span className="flex flex-row items-center gap-2">
                        {item.type === 'enterprise' ? (
                          <Building2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        ) : (
                          <Building className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        )}
                        <span className="flex flex-col">
                          <span>{name}</span>
                          <span className="text-xs text-muted-foreground">{subtitle}</span>
                        </span>
                      </span>
                      <Check
                        className={cn(
                          "h-4 w-4 ml-2 flex-shrink-0",
                          isItemSelected(item) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
