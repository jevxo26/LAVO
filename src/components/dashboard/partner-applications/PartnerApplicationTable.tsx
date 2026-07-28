"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type Application = {
  id: string;

  phone: string;
  targetCity: string;
  experience?: string | null;
  reason: string;

  status: "PENDING" | "APPROVED" | "REJECTED";

  createdAt: string;

  user: {
    fullName: string;
    email: string;
  };

  reviewedBy?: {
    fullName: string;
  } | null;
};

type Props = {
  applications: Application[];
};

const statusColor = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const PartnerApplicationTable = ({ applications }: Props) => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          Partner Applications
        </h1>

        <p className="text-sm text-slate-500">
          Review vendor partnership requests.
        </p>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Target City</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {applications.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>{item.user.fullName}</div>
                      <div className="text-xs text-slate-500">
                        {item.user.email}
                      </div>
                    </TableCell>

                    <TableCell>{item.phone}</TableCell>

                    <TableCell>{item.targetCity}</TableCell>

                    <TableCell>
                      {item.experience || "-"}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </TableCell>

                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/dashboard/partner-applications/${item.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerApplicationTable;