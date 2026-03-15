"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    useCase: "",
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Registration successful!");
        setFormData({ name: "", email: "", company: "", role: "", useCase: "", consent: false });
      } else {
        toast.error(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Work Email *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
          placeholder="john@company.com"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium mb-2">
          Company *
        </label>
        <input
          type="text"
          id="company"
          required
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
          placeholder="Acme Inc."
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-2">
          Role
        </label>
        <input
          type="text"
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
          placeholder="Facilities Manager"
        />
      </div>

      <div>
        <label htmlFor="useCase" className="block text-sm font-medium mb-2">
          Use Case
        </label>
        <textarea
          id="useCase"
          value={formData.useCase}
          onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
          placeholder="Tell us about your building(s) and challenges..."
          rows={3}
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent"
          required
          checked={formData.consent}
          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
        />
        <label htmlFor="consent" className="text-sm text-muted-foreground">
          I agree to receive communications from Synclo about product updates and demos. *
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Submitting..." : "Register Interest"}
      </button>
    </form>
  );
}
