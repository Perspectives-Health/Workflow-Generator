import { Button } from "@/modules/shared/ui/components/button";
import { CentersCombobox } from "@/modules/centers/ui/components/CentersCombobox";
import { useCentersQueries } from "@/modules/centers/ui/use-centers-queries";
import { sharedStorage } from "@/modules/shared/shared.storage";
import { useStorageValue } from "@/modules/shared/ui/hooks/use-storage-value";
import { navigate } from "@/modules/shared/shared.utils";


export function ViewCenterMenu() {
    const { useGetCenters, useGetEnterprises } = useCentersQueries();
    const { data: centers } = useGetCenters();
    const { data: enterprises } = useGetEnterprises();
    const { value: selectedCenter } = useStorageValue(sharedStorage.selectedCenter)
    const { value: selectedEnterprise } = useStorageValue(sharedStorage.selectedEnterprise)

    const handleNext = () => {
        if (!selectedCenter && !selectedEnterprise) {
            return;
        }
        navigate("view-workflows");
    }

    return (
        <div className="w-full flex flex-col gap-2 p-2">
            {centers && enterprises && <CentersCombobox centers={centers} enterprises={enterprises} />}
            <div className="flex flex-row justify-end w-full">
                <Button variant="default"
                size="sm"
                 onClick={handleNext}
                 className="px-3 py-2 text-xs bg-primary text-white hover:bg-primary/90"
                 >
                    Next
                </Button>
            </div>
        </div>
    );
}