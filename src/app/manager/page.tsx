"use client";

import React, { useEffect, useState } from "react";
import axios from 'axios';
import Image from "next/image";
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

/**
 * @typedef {Object} TransactionWithSummary
 * @extends Transaction
 * @property {string} order_summary - Summary of the transaction order.
 */
interface TransactionWithSummary extends Transaction {
  order_summary: string;
}

/**
 * ManagerDashboard Component
 * Displays a dashboard for the manager, including transaction data, inventory alerts, and weather updates.
 *
 * @returns {JSX.Element} The rendered ManagerDashboard component.
 */
const ManagerDashboard = () => {
  const [transactions, setTransactions] = useState<TransactionWithSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [reorderItems, setReorderItems] = useState<boolean>(false);
  const [reorderInventory, setReorderInventory] = useState<string[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showWeatherBoard, setShowWeatherBoard] = useState(true);
  const [showWeatherDialog, setShowWeatherDialog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAlertPreference = localStorage.getItem("showInventoryAlerts");
      const savedWeatherPreference = localStorage.getItem("showWeatherBoard");
      setShowAlerts(savedAlertPreference === null ? true : savedAlertPreference === "true");
      setShowWeatherBoard(savedWeatherPreference === null ? true : savedWeatherPreference === "true");
      const name = localStorage.getItem("employeeName");
      if (name) setEmployeeName(name);
      setIsInitialized(true);
      setHasMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    /**
     * Fetch transaction data.
     * Includes order summaries.
     */
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions?summary=true");
        if (!response.ok) throw new Error("Failed to fetch transactions");
        const data: TransactionWithSummary[] = await response.json();
        setTransactions(data);
        setShowWeatherDialog(showWeatherBoard);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    /**
     * Fetch reorder inventory alerts.
     */
    const fetchReorderInventory = async () => {
      try {
        if (!showAlerts) {
          setReorderItems(false);
          setReorderInventory([]);
          return;
        }

        const response = await fetch("/api/inventory/reorder_alert");
        if (!response.ok) throw new Error("Failed to fetch reorder inventory items");
        const data: { name: string }[] = await response.json();
        setReorderInventory(data.map(item => item.name));
        setReorderItems(data.length > 0);
      } catch (error) {
        console.error("Error fetching reorder inventory items:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
      }
    }

    fetchTransactions();
    fetchReorderInventory();
  }, [showAlerts, hasMounted]);

   /**
   * Toggles the inventory alert system.
   * @param {boolean} checked - New state of the alert toggle.
   */
  const handleAlertToggle = (checked: boolean) => {
    if (typeof window !== 'undefined') {
      setShowAlerts(checked);
      localStorage.setItem("showInventoryAlerts", checked.toString());
      if (!checked) {
        setReorderItems(false);
        setReorderInventory([]);
      }
    }
  };

  /**
   * Toggles the weather alert system.
   * @param {boolean} checked - New state of the weather alert toggle.
   */
  const handleWeatherAlertToggle = (checked: boolean) => {
    if (typeof window !== 'undefined') {
      setShowWeatherBoard(checked);
      localStorage.setItem("showWeatherBoard", checked.toString());
    }
    if(!checked) {
      setShowWeatherDialog(false);
    }
  };

  /**
   * Switches the view to the cashier dashboard.
   */
  const switchToCashierView = () => {
    router.push("/cashier");
  };

  /**
   * Logs the user out and redirects to the home page.
   */
  const handleLogout = () => {
    router.push("/");
  };

  /**
   * weather dialog component
   * @returns {JSX.Element} The WeatherDialog component.
   */
  const WeatherDialog = () => {
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [weatherData, setWeatherData] = useState({
      cityName: '',
      temperature: 0,
      description: '',
      icon: '',
    });
  
    /**
     * Gets the business impact of the current weather.
     * @param description 
     * @returns {string} The business impact of the current weather.
     */
    const getBusinessImpact = (description: string) => {
      const lowercaseDesc = description.toLowerCase();
      if (lowercaseDesc.includes('clear') || lowercaseDesc.includes('sunny')) {
        return "The current weather is sunny, which indicates a likely increase in customer volume today compared to the usual.";
      } else if (lowercaseDesc.includes('rain') || lowercaseDesc.includes('drizzle')) {
        return "The current weather is rainy, which could lead to a decrease in customer volume today compared to typical levels.";
      } else if (lowercaseDesc.includes('cloud')) {
        return "The current weather is cloudy, which may result in moderate customer volume today.";
      }
      return "Current weather conditions suggest typical customer volume patterns for today.";
    };
  
    useEffect(() => {
      const fetchWeather = async (lat: number, lon: number) => {
        try {

          

          // Get city name from coordinates
          const geoResponse = await axios.get(
            `https://api.openweathermap.org/geo/1.0/reverse`,
            {
              params: {
                lat,
                lon,
                limit: 1,
                appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
              },
            }
          );
  
          const geoData = geoResponse.data as { name: string }[];
          const cityName = geoData[0].name;
  
          // Get weather data
          const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather`,
            {
              params: {
                lat,
                lon,
                appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
                units: 'imperial',
              },
            }
          );
  
          const data = weatherResponse.data as {
            main: { temp: number };
            weather: { description: string; icon: string }[];
          };
          setWeatherData({
            cityName,
            temperature: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          });
        } catch (error) {
          console.error('Error fetching weather:', error);
        } finally {
          setLoading(false);
        }
      };
  
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeather(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    }, []);
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Today&apos;s Weather Forecast</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{weatherData.cityName}</h3>
                  <p className="text-3xl font-bold">{weatherData.temperature}°F</p>
                  <p className="text-gray-600 capitalize">{weatherData.description}</p>
                </div>
                {weatherData.icon && (
                  <div className="flex-shrink-0">
                    <Image
                      src={weatherData.icon}
                      alt="Weather icon"
                      width={64}
                      height={64}
                    />
                  </div>
                )}
              </div>
              
              <DialogDescription className="text-base">
                {getBusinessImpact(weatherData.description)}
              </DialogDescription>
  
              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
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
              <div className="flex flex-col space-y-2">
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
                  <Label htmlFor="show-alerts" className="text-sm">Show Weather Board</Label>
                  <Switch
                    id="show-alerts"
                    checked={showWeatherBoard}
                    disabled={!isInitialized}
                    onCheckedChange={handleWeatherAlertToggle}
                  />
                </div>
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
      {!isLoading && showWeatherDialog && <WeatherDialog />}
    </div>
  );
};

export default ManagerDashboard;