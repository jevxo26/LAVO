import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CreateUserDialog from "./CreateUserDialog";
import { Plus } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface UserTableProps {
  onCreate: () => void;
  onEdit: (user: User) => void;
}

const UserTable = ({ onCreate, onEdit }: UserTableProps) => {

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>

          <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
            </Button>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="p-3">John Doe</td>
                  <td className="p-3">john@gmail.com</td>
                  <td className="p-3">01700000000</td>
                  <td className="p-3 text-right">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            onEdit({
                            id: 1,
                            name: "John Doe",
                            email: "john@gmail.com",
                            phone: "01700000000",
                            })
                        }
                        >
                        Edit
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default UserTable;