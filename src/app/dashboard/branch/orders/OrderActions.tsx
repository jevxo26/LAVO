import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Truck, QrCode, Loader2, UserPlus, FileImage, Store, ArrowUpRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export function OrderActions({ order, onUpdate }: { order: any, onUpdate?: () => void }) {
  const [agents, setAgents] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [vendorOpen, setVendorOpen] = useState(false)
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

  const openVendorModal = async () => {
    setVendorOpen(true)
    setLoading(true)
    try {
      const res = await fetch('/api/branch-dashboard/vendors', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('laundrix_token')}` }
      })
      const json = await res.json()
      if (res.ok && json.success) setVendors(json.data.vendors || [])
    } catch (err) {
      toast.error("Failed to load partner vendors")
    }
    setLoading(false)
  }

  const assignVendor = async (vendorId: string) => {
    try {
      const res = await fetch('/api/branch-dashboard/vendors/assign-order', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('laundrix_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId: order.id, vendorId })
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(json.message || "Vendor assigned successfully")
        setVendorOpen(false)
        if (onUpdate) onUpdate()
      } else {
        toast.error(json.message || "Failed to assign vendor")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
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

      {(!order.pickupAgentId && (order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED')) && (
        <Button variant="outline" size="sm" onClick={openAssignModal} title="Assign Delivery Agent">
          <Truck className="h-4 w-4 text-orange-500" />
        </Button>
      )}

      <Button variant="outline" size="sm" onClick={openVendorModal} title="Delegate Order to Partner Vendor">
        <Store className="h-4 w-4 text-indigo-600" />
      </Button>

      <Button variant="outline" size="sm" title="QR Codes" onClick={openQrModal}>
        <QrCode className="h-4 w-4" />
      </Button>

      <Dialog open={vendorOpen} onOpenChange={setVendorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Order #{order.orderNumber} to Vendor</DialogTitle>
            <DialogDescription className="text-xs">
              Select a partner vendor from your branch to delegate garment processing based on live capacity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pt-2">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6 text-indigo-600" /></div>
          ) : vendors.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-4">No vendors found for this branch.</p>
          ) : (
            vendors.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50">
                <div>
                  <p className="font-bold text-sm text-slate-900">{v.businessName}</p>
                  <p className="text-xs text-slate-500">Code: {v.vendorCode} • {v.phone}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <Badge variant="outline" className={v.availableCapacity > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}>
                      {v.availableCapacity} / {v.dailyCapacity} Slots Available
                    </Badge>
                  </div>
                </div>
                <Button size="sm" disabled={v.isFull} onClick={() => assignVendor(v.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl">
                  Assign <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            ))
          )}
          </div>
        </DialogContent>
      </Dialog>

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
