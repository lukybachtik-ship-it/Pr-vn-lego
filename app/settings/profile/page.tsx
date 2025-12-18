"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AppLayout } from "@/components/app-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Building2, Upload, Trash2, Save, Loader2 } from "lucide-react"
import { getUserProfile, saveUserProfile, uploadLogo, deleteLogo, type UserProfile } from "@/lib/user-profile"
import { supabase } from "@/lib/supabase"

// Skeleton component
function SkeletonProfileSettings() {
  return (
    <div className="p-5 lg:p-6 max-w-[800px] mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-card border border-border rounded-md stagger-item">
            <Skeleton className="h-5 w-40 mb-3" />
            <Skeleton className="h-4 w-64 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Partial<UserProfile>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const userProfile = await getUserProfile()
      if (userProfile) {
        setProfile(userProfile)
        setLogoPreview(userProfile.logoUrl || null)
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = async () => {
    if (profile.logoUrl) {
      const deleted = await deleteLogo(profile.logoUrl)
      if (deleted) {
        setProfile({ ...profile, logoUrl: undefined })
        setLogoPreview(null)
        setLogoFile(null)
      }
    } else {
      setLogoPreview(null)
      setLogoFile(null)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let logoUrl = profile.logoUrl

      // Upload new logo if selected
      if (logoFile) {
        console.log("Uploading logo file:", logoFile.name, logoFile.size, "bytes")
        const uploadedUrl = await uploadLogo(logoFile)
        if (uploadedUrl) {
          console.log("Logo uploaded successfully:", uploadedUrl)
          // Delete old logo if exists
          if (profile.logoUrl) {
            console.log("Deleting old logo:", profile.logoUrl)
            await deleteLogo(profile.logoUrl)
          }
          logoUrl = uploadedUrl
        } else {
          console.error("Logo upload returned null")
          alert("Nepodařilo se nahrát logo. Zkontrolujte, zda máte vytvořený veřejný bucket 'logos' v Supabase Storage.")
          return
        }
      }

      console.log("Saving profile with logo URL:", logoUrl)
      const savedProfile = await saveUserProfile({
        ...profile,
        logoUrl,
      })

      if (savedProfile) {
        setProfile(savedProfile)
        setLogoPreview(savedProfile.logoUrl || null)
        setLogoFile(null)
        alert("Profil byl úspěšně uložen")
      } else {
        alert("Nepodařilo se uložit profil. Zkontrolujte Supabase konfiguraci.")
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
      alert(`Chyba při ukládání profilu: ${error instanceof Error ? error.message : "Neznámá chyba"}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    const newPassword = prompt("Zadejte nové heslo:")
    if (!newPassword) return

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        alert(`Chyba při změně hesla: ${error.message}`)
      } else {
        alert("Heslo bylo úspěšně změněno")
      }
    } catch (error: any) {
      alert(`Chyba: ${error.message}`)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <SkeletonProfileSettings />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[800px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <User className="w-6 h-6 text-primary" strokeWidth={1.75} />
                Nastavení profilu
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Spravujte své osobní údaje a firemní informace</p>
            </div>
          </div>
        </header>

        <div className="space-y-4">

          {/* User Info */}
          <div className="p-4 bg-card border border-border rounded-md stagger-item" style={{ animationDelay: "0ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-primary" strokeWidth={1.75} />
              <h3 className="text-sm font-medium">Uživatelský účet</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Informace o vašem účtu</p>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
              </div>
              <div>
                <Button onClick={handleChangePassword} variant="outline" size="sm">
                  Změnit heslo
                </Button>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="p-4 bg-card border border-border rounded-md stagger-item" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-primary" strokeWidth={1.75} />
              <h3 className="text-sm font-medium">Firemní údaje</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Tyto údaje se zobrazí na fakturách a smlouvách</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName" className="text-xs font-medium text-muted-foreground mb-1.5 block">Název firmy</Label>
                <Input
                  id="companyName"
                  placeholder="např. Vaše firma s.r.o."
                  value={profile.companyName || ""}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="companyAddress" className="text-xs font-medium text-muted-foreground mb-1.5 block">Adresa firmy</Label>
                <Textarea
                  id="companyAddress"
                  placeholder="např. Dlouhá 123, 110 00 Praha 1"
                  value={profile.companyAddress || ""}
                  onChange={(e) => setProfile({ ...profile, companyAddress: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="companyIco" className="text-xs font-medium text-muted-foreground mb-1.5 block">IČO</Label>
                  <Input
                    id="companyIco"
                    placeholder="12345678"
                    value={profile.companyIco || ""}
                    onChange={(e) => setProfile({ ...profile, companyIco: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="companyDic" className="text-xs font-medium text-muted-foreground mb-1.5 block">DIČ (volitelné)</Label>
                  <Input
                    id="companyDic"
                    placeholder="CZ12345678"
                    value={profile.companyDic || ""}
                    onChange={(e) => setProfile({ ...profile, companyDic: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="p-4 bg-card border border-border rounded-md stagger-item" style={{ animationDelay: "100ms" }}>
            <h3 className="text-sm font-medium mb-2">Logo firmy</h3>
            <p className="text-xs text-muted-foreground mb-4">Logo se zobrazí v hlavičce dokumentů (faktury, smlouvy)</p>
            <div className="space-y-4">
              {logoPreview && (
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border border-border rounded-md flex items-center justify-center bg-white overflow-hidden">
                    <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <Button onClick={handleRemoveLogo} variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                    Odstranit logo
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="logo" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {logoPreview ? "Změnit logo" : "Nahrát logo"}
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Doporučená velikost: 200x200 px. Formáty: PNG, JPG, SVG
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-2 pt-2 stagger-item" style={{ animationDelay: "150ms" }}>
            <Button onClick={() => router.back()} variant="outline" size="sm">
              Zrušit
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Ukládám...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                  Uložit změny
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
