"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import UserTable from "@/components/dashboard/users/UserTable";
import CreateUserDialog from "@/components/dashboard/users/CreateUserDialog";
import UpdateUserDialog from "@/components/dashboard/users/UpdateUserDialog";


interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const UserPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage customers, staff and admin users.
          </p>
        </div>
      </div>

      {/* Table */}
      <UserTable
        onCreate={() => setCreateOpen(true)}
        onEdit={(user) => {
          setSelectedUser(user);
          setUpdateOpen(true);
        }}
      />

      {/* Create Modal */}
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {/* Update Modal */}
      <UpdateUserDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        user={selectedUser}
      />
    </section>
  );
};

export default UserPage;