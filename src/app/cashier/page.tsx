'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { MenuItem } from '@/types/db.types'

type OrderItem = MenuItem & {
  quantity: number
}

const CashierPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [customerName, setCustomerName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch menu items on component mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('/api/menu')
        if (!response.ok) {
          throw new Error('Failed to fetch menu items')
        }
        const data = await response.json()
        setMenuItems(data)
      } catch (err) {
        setError('Failed to load menu items')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  // Filter menu items based on selected category
  const filteredMenuItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.item_type === selectedCategory)

  const addToOrder = (item: MenuItem) => {
    setCurrentOrder(prev => {
      const existingItem = prev.find(orderItem => orderItem.id === item.id)
      if (existingItem) {
        return prev.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromOrder = (itemId: number) => {
    setCurrentOrder(prev => 
      prev.map(item => 
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => item.quantity > 0)
    )
  }

  const clearOrder = () => {
    setCurrentOrder([])
    setCustomerName("")
  }

  const getOrderTotal = () => {
    return currentOrder.reduce((total, item) => total + (Number(item.price) * item.quantity), 0)
  }

  const submitOrder = async () => {
    try {
      const orderData = {
        customer_name: customerName || "Guest",
        cashier_name: "Current Cashier",
        sale_price: getOrderTotal(),
        items: currentOrder.reduce((sum, item) => sum + item.quantity, 0),
        meals: currentOrder.filter(item => item.item_type === 'entree').reduce((sum, item) => sum + item.quantity, 0),
        appetizers: currentOrder.filter(item => item.item_type === 'appetizer').reduce((sum, item) => sum + item.quantity, 0),
        drinks: currentOrder.filter(item => item.item_type === 'drink').reduce((sum, item) => sum + item.quantity, 0),
        date: new Date(),
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit order')
      }

      clearOrder()
    } catch (err) {
      setError('Failed to submit order')
      console.error(err)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="w-2/3 p-4 bg-gray-50">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex justify-between items-center">
              <CardTitle>Add Items</CardTitle>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="entree">Entrées</SelectItem>
                  <SelectItem value="side">Sides</SelectItem>
                  <SelectItem value="appetizer">Appetizers</SelectItem>
                  <SelectItem value="drink">Drinks</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grid" className="h-full">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              <TabsContent value="grid" className="mt-4 h-[calc(100vh-220px)] overflow-y-auto">
                <div className="grid grid-cols-3 gap-4 pb-4">
                  {filteredMenuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center"
                      onClick={() => addToOrder(item)}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">${Number(item.price).toFixed(2)}</span>
                      {item.premium && (
                        <span className="text-xs text-yellow-600">Premium</span>
                      )}
                    </Button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="list" className="h-[calc(100vh-220px)] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMenuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.item_type}</TableCell>
                        <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            onClick={() => addToOrder(item)}
                          >
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="w-1/3 p-4 bg-white border-l">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Current Order</CardTitle>
            <Input
              placeholder="Customer Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <ScrollArea className="flex-grow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrder.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${(Number(item.price) * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromOrder(item.id)}
                        >
                          -
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            
            <div className="mt-4 space-y-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>${getOrderTotal().toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearOrder}
                  disabled={currentOrder.length === 0}
                >
                  Clear Order
                </Button>
                <Button 
                  className="w-full"
                  onClick={submitOrder}
                  disabled={currentOrder.length === 0}
                >
                  Complete Order
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CashierPage