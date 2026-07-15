"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'

export default function BranchAnalytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/branch-dashboard/analytics', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('laundrix_token')}` }
    })
    .then(res => res.json())
    .then(res => {
      setData(res.data)
      setLoading(false)
    })
    .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading analytics...</div>
  if (!data) return <div className="p-8">Error loading analytics.</div>

  // Merge revenue and expenses for the chart
  const chartData = data.revenue.map((rev: any, i: number) => ({
    name: rev.name,
    revenue: rev.total,
    expenses: data.expenses[i]?.total || 0,
    profit: rev.total - (data.expenses[i]?.total || 0)
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branch Analytics</h1>
        <p className="text-muted-foreground">Detailed financial and performance reports.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.revenue.reduce((acc: number, val: any) => acc + val.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.expenses.reduce((acc: number, val: any) => acc + val.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(
                data.revenue.reduce((acc: number, val: any) => acc + val.total, 0) -
                data.expenses.reduce((acc: number, val: any) => acc + val.total, 0)
              ).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Financial Performance Tracker</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" activeDot={{ r: 8 }} name="Revenue ($)" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses ($)" />
              <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit ($)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
