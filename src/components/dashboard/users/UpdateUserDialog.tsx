import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

const UpdateUserDialog = ({
  open,
  onOpenChange,
  user,
}: Props) => {
  useEffect(() => {
    if (user) {
      console.log("Editing:", user);
      // React Hook Form ব্যবহার করলে এখানে form.reset(user) করবেন
    }
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
          <DialogDescription>
            Update the selected user's information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              defaultValue={user?.name}
              placeholder="Enter name"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              defaultValue={user?.email}
              placeholder="Enter email"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              defaultValue={user?.phone}
              placeholder="Enter phone"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button>
              Update User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserDialog;