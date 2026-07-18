"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import io from 'socket.io-client'

import { OrderActions } from './OrderActions'

export default function BranchOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = () => {
    fetch('/api/branch-dashboard/orders', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('laundrix_token')}` }
    })
    .then(res => res.json())
    .then(res => {
      setOrders(res.data || [])
      setLoading(false)
    })
    .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()

    // Listen for WebSocket updates from the QR scanner
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
    // TODO: Connect to the actual branch ID room instead of current_branch_id_mock
    socket.emit('joinBranch', 'current_branch_id_mock')
    
    socket.on('garmentStatusUpdated', (data: any) => {
      console.log('Real-time update received:', data)
      fetchOrders() // Refresh orders on update
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      case 'READY_FOR_DELIVERY': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <div className="p-8">Loading orders...</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Orders</h1>
        <p className="text-muted-foreground">Manage laundry orders currently in the facility.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!orders || orders.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No orders found.</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer?.user?.fullName || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.orderStatus)} variant="outline">
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>${order.grandTotal}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <OrderActions order={order} onUpdate={fetchOrders} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
