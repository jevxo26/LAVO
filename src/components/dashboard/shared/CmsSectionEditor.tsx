"use client";

import React, { useState } from "react";
import { X, Save, Plus, Trash2, RefreshCw } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Prisma } from "@prisma/client";

type SectionWithItems = Prisma.CmsSectionGetPayload<{
  include: { items: true }
}>;

type EditorItem = Partial<Prisma.CmsContentItemGetPayload<object>> & {
  isNew?: boolean;
  markedForDeletion?: boolean;
  id: string;
};

interface CmsSectionEditorProps {
  section: SectionWithItems;
  onClose: () => void;
  onSaved: () => void;
}

export function CmsSectionEditor({ section, onClose, onSaved }: CmsSectionEditorProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: section.id,
    pageId: section.pageId,
    sectionKey: section.sectionKey,
    title: section.title || "",
    subtitle: section.subtitle || "",
    displayOrder: section.displayOrder,
  });

  const [items, setItems] = useState<EditorItem[]>(
    section.items ? [...section.items].sort((a, b) => a.displayOrder - b.displayOrder) : []
  );

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `temp-${Date.now()}`,
        isNew: true,
        title: "",
        subtitle: "",
        content: "",
        icon: "",
        displayOrder: items.length + 1,
      },
    ]);
  };

  const removeItem = (index: number) => {
    const item = items[index];
    if (!item.isNew) {
      const newItems = [...items];
      newItems[index] = { ...item, markedForDeletion: true };
      setItems(newItems);
    } else {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const saveChanges = async () => {
    setLoading(true);
    try {
      // Save Section
      await axios.post("/api/cms/sections", formData);

      // Save Items
      for (const item of items) {
        if (item.markedForDeletion) {
          await axios.delete(`/api/cms/items/${item.id}`);
        } else if (item.isNew) {
          await axios.post("/api/cms/items", {
            sectionId: section.id,
            title: item.title,
            subtitle: item.subtitle,
            content: item.content,
            icon: item.icon,
            displayOrder: item.displayOrder,
          });
        } else {
          await axios.put(`/api/cms/items/${item.id}`, {
            title: item.title,
            subtitle: item.subtitle,
            content: item.content,
            icon: item.icon,
            displayOrder: item.displayOrder,
          });
        }
      }
      toast.success("Section updated successfully");
      onSaved();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Section: <span className="text-blue-600 uppercase font-mono text-sm ml-2">{section.sectionKey}</span></h2>
            <p className="text-sm text-slate-500 mt-1">Make changes to the content and layout items below.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section Details */}
          <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2">Section Content</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleSectionChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Section main heading"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle / Description</label>
              <textarea
                name="subtitle"
                value={formData.subtitle}
                onChange={handleSectionChange}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Section subtitle or descriptive text"
              />
            </div>
          </div>

          {/* Section Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Content Items ({items.filter(i => !i.markedForDeletion).length})</h3>
              <button 
                onClick={addItem}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => {
                if (item.markedForDeletion) return null;
                return (
                  <div key={item.id} className="relative bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-colors group">
                    <button 
                      onClick={() => removeItem(index)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-12">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Item Title</label>
                        <input
                          type="text"
                          value={item.title || ""}
                          onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Subtitle / Badge</label>
                        <input
                          type="text"
                          value={item.subtitle || ""}
                          onChange={(e) => handleItemChange(index, 'subtitle', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Content</label>
                        <textarea
                          value={item.content || ""}
                          onChange={(e) => handleItemChange(index, 'content', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Icon Name (Lucide)</label>
                        <input
                          type="text"
                          value={item.icon || ""}
                          onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                          placeholder="e.g. Shield, Truck"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Order</label>
                        <input
                          type="number"
                          value={item.displayOrder}
                          onChange={(e) => handleItemChange(index, 'displayOrder', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {items.filter(i => !i.markedForDeletion).length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
                  <p>No content items for this section.</p>
                  <button onClick={addItem} className="mt-2 text-blue-600 text-sm font-medium hover:underline">
                    Add the first item
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={saveChanges}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}
