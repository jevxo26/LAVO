"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Truck, QrCode, Loader2, UserPlus, FileImage } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export function OrderActions({ order, onUpdate }: { order: any, onUpdate?: () => void }) {
  const [agents, setAgents] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/branch-dashboard/delivery-agents', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('laundrix_token')}` }
      })
      const json = await res.json()
      if (res.ok) setAgents(json.data)
    } catch (err) {
      toast.error("Failed to load agents")
    }
    setLoading(false)
  }

  const assignAgent = async (agentId: string) => {
    try {
      const res = await fetch('/api/branch-dashboard/orders/assign-agent', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('laundrix_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId: order.id, agentId })
      })
      if (res.ok) {
        toast.success("Agent assigned successfully")
        if (onUpdate) onUpdate()
      } else {
        toast.error("Failed to assign agent")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  const fetchQrCodes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/branch-dashboard/orders/${order.id}/qr-codes`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('laundrix_token')}` }
      })
      const json = await res.json()
      if (res.ok) setItems(json.data)
    } catch (err) {
      toast.error("Failed to load items")
    }
    setLoading(false)
  }

  const generateQrCode = async (garmentItemId: string) => {
    try {
      const res = await fetch(`/api/branch-dashboard/garment-items/${garmentItemId}/generate-qr`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('laundrix_token')}` }
      })
      if (res.ok) {
        toast.success("QR Code generated")
        fetchQrCodes() // refresh the list
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  return (
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" title="Assign Delivery Agent" onClick={fetchAgents}>
            <Truck className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Delivery Agent</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6" /></div>
            ) : agents.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No agents available.</p>
            ) : (
              agents.map(agent => (
                <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{agent.user?.fullName || agent.employeeCode}</p>
                    <p className="text-xs text-slate-500">{agent.phone}</p>
                  </div>
                  <Button size="sm" onClick={() => assignAgent(agent.id)}>
                    <UserPlus className="h-4 w-4 mr-1" /> Assign
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" title="QR Codes" onClick={fetchQrCodes}>
            <QrCode className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Garment QR Codes</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6" /></div>
            ) : items.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No garments found for this order.</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.garmentName} <span className="text-xs text-slate-500">({item.garmentCode})</span></p>
                    {item.qrCodeRecord ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="font-mono text-xs">{item.qrCodeRecord.qrCode}</Badge>
                      </div>
                    ) : (
                      <p className="text-xs text-orange-500 mt-1">No QR Code yet</p>
                    )}
                  </div>
                  {!item.qrCodeRecord ? (
                    <Button size="sm" onClick={() => generateQrCode(item.id)}>Generate</Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${item.qrCodeRecord.qrCode}`, '_blank')}>
                      <FileImage className="h-4 w-4 mr-1" /> View
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
