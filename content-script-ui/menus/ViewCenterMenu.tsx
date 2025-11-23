import { Button } from "@/components/ui/button";
import { CentersCombobox } from "@/modules/centers/ui/components/CentersCombobox";
import { useCentersQueries } from "@/modules/centers/ui/use-centers-queries";
import { sharedStorage } from "@/modules/shared/shared.storage";
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value";
import { navigate } from "@/modules/shared/shared.utils";


export function ViewCenterMenu() {
    const { useGetCenters } = useCentersQueries();
    const { data: centers } = useGetCenters();
    const { value: selectedCenter } = useStorageValue(sharedStorage.selectedCenter)

    const handleNext = () => {
        if (!selectedCenter) {
            return;
        }
        navigate("view-workflows");
    }

    return (
        <div className="w-full flex flex-col gap-2">
            {centers && <CentersCombobox centers={centers} />}
            <div className="flex flex-row justify-end w-full">
                <Button variant="default"
                size="default"
                 onClick={handleNext}
                 className="px-3 py-2 text-sm bg-primary text-white hover:bg-primary/90"
                 >
                    Next
                </Button>
            </div>
        </div>
    );
}