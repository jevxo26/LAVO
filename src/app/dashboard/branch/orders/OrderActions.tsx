"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Truck, QrCode, Loader2, UserPlus, FileImage } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export function OrderActions({ order, onUpdate }: { order: any, onUpdate?: () => void }) {
  const [agents, setAgents] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const openAssignModal = async () => {
    setAssignOpen(true)
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
        setAssignOpen(false)
        if (onUpdate) onUpdate()
      } else {
        toast.error("Failed to assign agent")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  const openQrModal = async () => {
    setQrOpen(true)
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
        // Just refetch exactly as if opening modal
        const r = await fetch(`/api/branch-dashboard/orders/${order.id}/qr-codes`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('laundrix_token')}` }
        })
        const j = await r.json()
        if (r.ok) setItems(j.data)
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  const markReadyForDelivery = async () => {
    try {
      const res = await fetch(`/api/branch-dashboard/orders/${order.id}/ready-for-delivery`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('laundrix_token')}` }
      })
      if (res.ok) {
        toast.success("Order marked as Ready! Delivery Agent automatically assigned for Drop-off.");
        if (onUpdate) onUpdate();
      } else {
        toast.error("Failed to mark order as ready");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  }

  return (
    <div className="flex gap-2">
      {order.orderStatus === 'PROCESSING' && (
        <Button variant="default" size="sm" onClick={markReadyForDelivery} title="Mark Ready for Delivery">
          Mark Ready
        </Button>
      )}
      <Button variant="outline" size="sm" title="Assign Delivery Agent" onClick={openAssignModal}>
        <Truck className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="sm" title="QR Codes" onClick={openQrModal}>
        <QrCode className="h-4 w-4" />
      </Button>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Delivery Agent</DialogTitle>
          </DialogHeader>
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

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Garment QR Codes</DialogTitle>
          </DialogHeader>
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
