"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Home } from "lucide-react"
import Link from "next/link"
import { saveClient } from "@/lib/clients"
import { IcoVerifier } from "@/components/ico-verifier"

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
      region: formData.region || undefined,
      contactPerson: formData.contactPerson || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      notes: formData.notes || undefined,
      source: ico ? "ares" : "manual",
    })

    router.push(`/clients/${newClient.id}`)
  }

  const isFormValid = formData.name.trim().length > 0

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" title="Domů">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/clients">
            <Button variant="ghost" size="icon" title="Zpět na klienty">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Nový klient</h1>
            <p className="text-muted-foreground mt-1">Přidejte nového klienta do adresáře</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ICO Verification */}
          <Card>
            <CardHeader>
              <CardTitle>Ověření IČO (volitelné)</CardTitle>
            </CardHeader>
            <CardContent>
              <IcoVerifier value={ico} onChange={setIco} onVerified={handleIcoVerified} required={false} />
              <p className="text-sm text-muted-foreground mt-2">
                Pokud zadáte IČO, údaje se automaticky doplní z registru ARES
              </p>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Základní údaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Název / Jméno <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="např. ABC s.r.o. nebo Jan Novák"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ulice a číslo popisné</label>
                <Input
                  placeholder="např. Hlavní 123/45"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">PSČ</label>
                  <Input
                    placeholder="110 00"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Město</label>
                  <Input
                    placeholder="Praha"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Kraj</label>
                <Input
                  placeholder="např. Hlavní město Praha"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Kontaktní údaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kontaktní osoba</label>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Telefon</label>
                <Input
                  type="tel"
                  placeholder="např. +420 777 123 456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="např. jan.novak@firma.cz"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Poznámky</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Interní poznámky o klientovi..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/clients">
              <Button type="button" variant="outline">
                Zrušit
              </Button>
            </Link>
            <Button type="submit" disabled={!isFormValid}>
              <Save className="w-4 h-4 mr-2" />
              Uložit klienta
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
