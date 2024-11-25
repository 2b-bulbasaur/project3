'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ShoppingCart, CreditCard, ArrowLeft, Check } from 'lucide-react';

import type { OrderItem } from '@/types/api.types';

/**
 * CheckoutPage Component
 * 
 * This component allows users to review their order, input customer details, 
 * and submit the order for processing. It handles form validation, promo code checks,
 * and order submission, while also managing loading, success, and error states.
 * 
 * @component
 */
const CheckoutPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [originalTotal, setOriginalTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);


 
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: ''
  });

   /**
   * useEffect hook to retrieve order and customer data from local storage
   * and initialize state variables when the component mounts.
   */
  useEffect(() => {
    const order = localStorage.getItem('currentOrder');
    const total = localStorage.getItem('orderTotal');
    const savedOriginalTotal = localStorage.getItem('originalTotal');
    const savedPromoCode = localStorage.getItem("promoCode");

    
    if (order) {
      setCurrentOrder(JSON.parse(order));
    }
    if (total) {
      setFinalTotal(parseFloat(total));
    }

    if (savedOriginalTotal) {
      setOriginalTotal(parseFloat(savedOriginalTotal));
    }


    if (savedPromoCode?.trim().toUpperCase() === "PANDA20") {
      setAppliedPromo(savedPromoCode);
    }
  }, []);

  /**
   * Handles input changes for customer details form.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Validates customer details (name, email, phone).
   * Displays error messages if validation fails.
   * 
   * @returns {boolean} - Returns true if validation is successful, false otherwise.
   */
  const validate = () => {
    const newErrors: { name: string; email: string; phone: string } = { name: '', email: '', phone: '' };
    let isValid = true;

    if (!customerDetails.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!customerDetails.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailPattern.test(customerDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    const phonePattern = /^\d{10}$/; 
    if (!customerDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!phonePattern.test(customerDetails.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Redirects the user back to the order page.
   */
  const handleBackToOrder = () => {
    router.push('/customer');
  };

  /**
   * Handles user logout and redirects to the login page.
   */
  const handleLogoutAndRedirect = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/customer/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/customer/login');
    }
  };

  /**
   * Submits the order data, including customer details, order summary, 
   * and promo code. Handles API request for order submission and checks 
   * promo eligibility for the next order.
   */
  const handleSubmitOrder = async () => {
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      setError("Please fill in all required fields");
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderData = {
        customer_name: customerDetails.name,
        cashier_name: "Self Service Kiosk",
        original_price: originalTotal,
        sale_price: finalTotal,
        promo_code: appliedPromo || null,
        discount_amount: appliedPromo ? (originalTotal - finalTotal) : 0,
        items: currentOrder.length,
        meals: currentOrder.filter(item => item.type === 'meal').length,
        appetizers: currentOrder.reduce((sum, item) => 
          item.type === 'appetizer' && item.item ? sum + item.item.quantity : sum, 0),
        drinks: currentOrder.reduce((sum, item) => 
          item.type === 'drink' && item.item ? sum + item.item.quantity : sum, 0),
        date: new Date().toISOString(),
        orderItems: currentOrder,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone
      };

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Failed to submit order');

     try {

      console.log("Checking promo eligibility...");
      const promoResponse = await fetch(`/api/customer_promo?email=${encodeURIComponent(customerDetails.email)}`);
      if (promoResponse.ok) {
        const promoData = await promoResponse.json();
        console.log("Promo check response", promoData);

        if (promoData.isEligibleForPromo) {
          console.log("User is eligible for promo on their next order! Email should be sent shortly.")
        }
        else if (promoData.ordersUntilNextPromo)
        {
          console.log("User is not eligible for promo at this time. They need", 5 - promoData.ordersUntilNextPromo, "more orders to qualify.")
        }
        else {
          console.log("User is not eligible for promo at this time.")
        }
      }
    }
    catch (promoError) {
      console.error("Error checking promo eligibility:", promoError);
    }
     
      
      localStorage.removeItem('currentOrder');
      localStorage.removeItem('orderTotal');
      localStorage.removeItem('originalTotal');
      localStorage.removeItem('promoCode');
      
      setSuccess(true);
      
      setTimeout(() => {
        handleLogoutAndRedirect();
      }, 2000);

    } catch (err) {
      setError('Failed to process order. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formats the price value to a string with 2 decimal points.
   * 
   * @param {number} price - The price to format.
   * @returns {string} - The formatted price string.
   */
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  /**
   * Renders the order summary in a table format.
   * 
   * @returns {JSX.Element} - The rendered table displaying the order summary.
   */
  const renderOrderSummary = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currentOrder.map((item, index) => (
          <TableRow key={index}>
            <TableCell>
              {item.type === 'meal' && item.meal
                ? `${item.meal.size} meal`
                : item.item?.name}
            </TableCell>
            <TableCell className="text-right">
              {item.type === 'meal' 
                ? '1'
                : item.item?.quantity || 1}
            </TableCell>
            <TableCell className="text-right">
              {item.type === 'meal' && item.meal
                ? formatPrice(
                    item.meal.size === 'bowl' 
                      ? 8.99 
                      : item.meal.size === 'plate' 
                        ? 10.99 
                        : 12.99
                  )
                : item.item 
                  ? formatPrice(item.item.price * (item.item.quantity || 1))
                  : '$0.00'}
            </TableCell>
          </TableRow>
        ))}
        
        <TableRow>
          <TableCell colSpan={2} className="text-right font-medium">Total:</TableCell>
          <TableCell className="text-right font-bold">{formatPrice(originalTotal)}</TableCell>
        </TableRow>
        {appliedPromo && (
          <>
          <TableRow>
          <TableCell colSpan={2} className="text-right text-green-600">
                Promo Code ({appliedPromo}):
              </TableCell>
              <TableCell className="text-right text-green-600">
              -${(originalTotal - finalTotal).toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2} className="text-right font-bold">
                Final Total:
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatPrice(finalTotal)}
              </TableCell>
            </TableRow>
          </>
        )}

{!appliedPromo && (
          <TableRow>
            <TableCell colSpan={2} className="text-right font-bold">Total:</TableCell>
            <TableCell className="text-right font-bold">{formatPrice(finalTotal)}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (success) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground">
              Thank you for your order. Redirecting you to the home page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={handleBackToOrder}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Order
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {renderOrderSummary()}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={customerDetails.name}
                  onChange={handleInputChange}
                />

                {errors.name && (
                  <span className="text-red-500 text-sm">Invalid Name</span>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={customerDetails.email}
                  onChange={handleInputChange}
                />

                {errors.email && (
                  <span className="text-red-500 text-sm">Invalid Email Address</span>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={customerDetails.phone}
                  onChange={handleInputChange}
                />

                {errors.phone && (
                  <span className="text-red-500 text-sm">Invalid Phone Number</span>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={handleSubmitOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay ${formatPrice(finalTotal)}`}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;