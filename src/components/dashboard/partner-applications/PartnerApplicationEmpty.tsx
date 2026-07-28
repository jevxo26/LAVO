import { FileSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PartnerApplicationEmpty = () => {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-5 rounded-full bg-slate-100 p-5">
          <FileSearch className="h-10 w-10 text-slate-500" />
        </div>

        <h2 className="text-2xl font-semibold text-slate-900">
          No Partner Applications
        </h2>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          There are currently no vendor partnership applications available.
        </p>
      </CardContent>
    </Card>
  );
};

export default PartnerApplicationEmpty;