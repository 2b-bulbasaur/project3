"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  MenuIcon,
  Package,
  Users,
  FileText,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Transaction } from "@/types/db.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface TransactionWithSummary extends Transaction {
  order_summary: string;
}

const ManagerDashboard = () => {
  const [transactions, setTransactions] = useState<TransactionWithSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [reorderItems, setReorderItems] = useState<boolean>(false); 
  const [reorderInventory, setReorderInventory] = useState<string[]>([]);
  const [showAlerts, setShowAlerts] = useState(() => {
    const savedAlertPreference = localStorage.getItem("showInventoryAlerts");
    return savedAlertPreference === null ? true : savedAlertPreference === "true";
  });
const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsInitialized(true);

    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions?summary=true");
        if (!response.ok) throw new Error("Failed to fetch transactions");
        const data: TransactionWithSummary[] = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchReorderInventory = async () => {
      try {
        if (!showAlerts) {
          setReorderItems(false);
          return;
        }

        const response = await fetch("/api/inventory/reorder_alert");
        if (!response.ok) throw new Error("Failed to fetch reorder inventory items");
        const data: { name: string }[] = await response.json();
        setReorderInventory(data.map(item => item.name));
        if (data.length > 0) setReorderItems(true);
      } catch (error) {
        console.error("Error fetching reorder inventory items:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
      }
    }

    fetchTransactions();
    fetchReorderInventory();
    
    const name = localStorage.getItem("employeeName");
    if (name) setEmployeeName(name);
  }, [showAlerts]);

  const handleAlertToggle = (checked: boolean) => {
    setShowAlerts(checked);
    localStorage.setItem("showInventoryAlerts", checked.toString());
    if (!checked) {
      setReorderItems(false);
    }
  };

  const switchToCashierView = () => {
    router.push("/cashier");
  };

  const handleLogout = () => {
    router.push("/");
  };

  // Loading skeleton row component
  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
    </TableRow>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Top Navigation Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <CardTitle>Manager Dashboard</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    Quick Actions <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={() => router.push("/manager/manage-menu")}
                  >
                    <MenuIcon className="mr-2 h-4 w-4" /> Manage Menu
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push("/manager/manage-inventory")}
                  >
                    <Package className="mr-2 h-4 w-4" /> Manage Inventory
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push("/manager/manage-employees")}
                  >
                    <Users className="mr-2 h-4 w-4" /> Manage Employees
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push("/manager/generate-reports")}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Generate Reports
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Label htmlFor="show-alerts" className="text-sm">Show Inventory Alerts</Label>
                <Switch
                  id="show-alerts"
                  checked={showAlerts}
                  disabled={!isInitialized}
                  onCheckedChange={handleAlertToggle}
                />
              </div>
              <div className="flex items-center space-x-2">
                <p>Welcome {employeeName}!</p>
                <Button variant="outline" onClick={switchToCashierView}>
                  <Settings className="mr-2 h-4 w-4" />
                  Switch to Cashier View
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Order Details</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        #{transaction.id}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleString()}
                      </TableCell>
                      <TableCell>{transaction.customer_name}</TableCell>
                      <TableCell>{transaction.cashier_name}</TableCell>
                      <TableCell>{transaction.order_summary}</TableCell>
                      <TableCell className="text-right">
                        ${Number(transaction.sale_price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {reorderItems && (
        <Dialog open={reorderItems} onOpenChange={setReorderItems}>
          <DialogContent className="max-w-md w-full p-6 bg-white rounded-lg">
            <DialogHeader>
              <DialogTitle>Reorder Inventory Alert</DialogTitle>
              <DialogDescription>
                The following inventory items need to be reordered:
              </DialogDescription>
            </DialogHeader>

            <ul className="list-disc list-inside mb-4">
              {reorderInventory.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="flex justify-end space-x-4">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={() => window.location.href = "/manager/manage-inventory"}>
                  Go to Inventory
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManagerDashboard;