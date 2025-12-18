"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, UserPlus } from "lucide-react"
import { saveClient } from "@/lib/clients"
import { IcoVerifier } from "@/components/ico-verifier"
import { AppLayout } from "@/components/app-layout"

export default function NewClientPage() {
  const router = useRouter()
  const [ico, setIco] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    zip: "",
    region: "",
    contactPerson: "",
    phone: "",
    email: "",
    notes: "",
  })

  const handleIcoVerified = (data: any) => {
    // Auto-fill from ARES data
    const streetAddress = [
      data.sidlo?.nazevUlice,
      data.sidlo?.cisloDomovni,
      data.sidlo?.cisloOrientacni ? `/${data.sidlo.cisloOrientacni}` : null,
    ]
      .filter(Boolean)
      .join(" ")
      .trim()

    setFormData({
      ...formData,
      name: data.obchodniJmeno || formData.name,
      street: streetAddress,
      city: data.sidlo?.nazevObce || formData.city,
      zip: data.sidlo?.psc || formData.zip,
      region: data.sidlo?.nazevKraje || formData.region,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newClient = saveClient({
      ico: ico || undefined,
      name: formData.name,
      street: formData.street || undefined,
      city: formData.city || undefined,
      zip: formData.zip || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
    })

    router.push(`/clients/${newClient.id}`)
  }

  const isFormValid = formData.name.trim().length > 0

  return (
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[800px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-primary" strokeWidth={1.75} />
            Nový klient
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Přidejte nového klienta do adresáře
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ICO Verification */}
          <div className="p-4 bg-card border border-border rounded-md stagger-item">
            <Label className="text-sm font-medium mb-3 block">Ověření IČO (volitelné)</Label>
            <IcoVerifier value={ico} onChange={setIco} onVerified={handleIcoVerified} required={false} />
            <p className="text-xs text-muted-foreground mt-2">
              Pokud zadáte IČO, údaje se automaticky doplní z registru ARES
            </p>
          </div>

          {/* Basic Info */}
          <div className="p-4 bg-card border border-border rounded-md stagger-item">
            <h3 className="text-sm font-medium mb-4">Základní údaje</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Název / Jméno <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="např. ABC s.r.o. nebo Jan Novák"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Ulice a číslo popisné
                </Label>
                <Input
                  placeholder="např. Hlavní 123/45"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">PSČ</Label>
                  <Input
                    placeholder="110 00"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Město</Label>
                  <Input
                    placeholder="Praha"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Kraj</Label>
                <Input
                  placeholder="např. Hlavní město Praha"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-4 bg-card border border-border rounded-md stagger-item">
            <h3 className="text-sm font-medium mb-4">Kontaktní údaje</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Kontaktní osoba
                </Label>
                <Input
                  placeholder="např. Jan Novák"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactPerson: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Telefon</Label>
                  <Input
                    type="tel"
                    placeholder="+420 777 123 456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</Label>
                  <Input
                    type="email"
                    placeholder="jan.novak@firma.cz"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="p-4 bg-card border border-border rounded-md stagger-item">
            <h3 className="text-sm font-medium mb-4">Poznámky</h3>
            <Textarea
              placeholder="Interní poznámky o klientovi..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => router.push("/clients")}>
              Zrušit
            </Button>
            <Button type="submit" size="sm" disabled={!isFormValid}>
              <Save className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
              Uložit klienta
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
