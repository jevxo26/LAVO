"use client"

import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Package, Truck, Clock, CheckCircle } from 'lucide-react'

export default function BranchOverview() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/branch-dashboard/overview', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('laundrix_token')}` }
    })
    .then(res => res.json())
    .then(res => {
      setData(res.data || { capacityUtilization: '0', activeOrders: 0, pendingOrders: 0, activeMachinery: [] })
      setLoading(false)
    })
    .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading overview...</div>
  if (!data) return <div className="p-8">Error loading overview.</div>

  const capacityData = [
    { name: 'Used', value: parseFloat(data.capacityUtilization), color: '#6366f1' },
    { name: 'Free', value: 100 - parseFloat(data.capacityUtilization), color: '#e2e8f0' }
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branch Overview</h1>
        <p className="text-muted-foreground">Monitor real-time capacity and order status.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.capacityUtilization}%</div>
            <p className="text-xs text-muted-foreground">Of maximum daily limit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeOrders}</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Waiting to be processed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Machinery Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.activeMachinery}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="active" fill="#6366f1" name="Active" />
                <Bar dataKey="count" fill="#e2e8f0" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Capacity Breakdown</CardTitle>
            <CardDescription>Daily load visualization</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capacityData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
