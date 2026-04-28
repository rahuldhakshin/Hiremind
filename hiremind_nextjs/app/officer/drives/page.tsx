"use client";
import React, { useState, useEffect } from "react";
import { GlassCard, GlassButton } from "@/components/ui/liquid-glass";
import { officerAPI } from "@/lib/api";
import { Calendar, Plus } from "lucide-react";

export default function PlacementDrivesPage() {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", drive_date: "", venue: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchDrives = () => {
    officerAPI.drives().then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setDrives(data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDrives(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await officerAPI.createDrive(form);
      fetchDrives();
      setShowForm(false);
      setForm({ title: "", drive_date: "", venue: "", description: "" });
    } catch (err: any) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : "Failed to create drive. Please try again.";
      setError(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label-caps mb-2" style={{ color: "#000000" }}>Campus Events</p>
          <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>Placement Drives</h1>
        </div>
        <GlassButton variant="primary" className="flex items-center gap-2 text-sm" onClick={() => { setShowForm(!showForm); setError(""); }}>
          <Plus size={14} /> Schedule Drive
        </GlassButton>
      </div>

      {showForm && (
        <GlassCard className="p-6 mb-6" hover={false}>
          <h2 className="text-lg font-bold mb-4" style={{ color: "#000000" }}>New Placement Drive</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="label-caps" style={{ color: "#000000" }}>Drive Name *</label>
                <input
                  className="glass-input"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  placeholder="Drive Name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label-caps" style={{ color: "#000000" }}>Venue</label>
                <input
                  className="glass-input"
                  value={form.venue}
                  onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                  placeholder="Main Auditorium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label-caps" style={{ color: "#000000" }}>Drive Date *</label>
                <input
                  type="datetime-local"
                  className="glass-input"
                  value={form.drive_date}
                  onChange={e => setForm(f => ({ ...f, drive_date: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="label-caps" style={{ color: "#000000" }}>Description</label>
              <textarea
                className="glass-input"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Drive details..."
                style={{ resize: "vertical" }}
              />
            </div>
            {error && (
              <p className="text-xs px-3 py-2" style={{ background: "rgba(200,0,0,0.06)", border: "1px solid rgba(200,0,0,0.2)", color: "#cc0000" }}>
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <GlassButton type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Scheduling..." : "Create Drive"}
              </GlassButton>
              <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="text-sm px-4 py-2" style={{ color: "#888888" }}>
                Cancel
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {loading ? (
        <div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Loading drives...</div>
      ) : drives.length === 0 ? (
        <GlassCard className="p-12 text-center" hover={false}>
          <Calendar size={32} className="mx-auto mb-4" style={{ color: "#000000" }} />
          <p className="text-lg font-semibold" style={{ color: "#000000" }}>No placement drives scheduled</p>
          <p className="text-sm mt-2" style={{ color: "#888888" }}>Schedule your first placement drive.</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-4">
          {drives.map((drive: any) => (
            <GlassCard key={drive.id} className="p-6" hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-bold mb-1" style={{ color: "#000000" }}>{drive.title || drive.name}</p>
                  <p className="text-sm" style={{ color: "#888888" }}>
                    {drive.drive_date
                      ? new Date(drive.drive_date).toLocaleString()
                      : drive.start_date ? new Date(drive.start_date).toLocaleDateString() : "TBD"} ·{" "}
                    {drive.venue || "Campus"}
                  </p>
                  {drive.description && (
                    <p className="text-xs mt-2" style={{ color: "#888888" }}>{drive.description}</p>
                  )}
                </div>
                <span className="text-xs font-bold flex-shrink-0 ml-4" style={{ color: "#000000", fontFamily: "Outfit" }}>
                  {drive.registered_count ?? drive.registrations ?? 0} registered
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
