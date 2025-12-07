"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AppHeader } from "@/components/app-header"
import { User, Building2, Upload, Trash2, Save } from "lucide-react"
import { getUserProfile, saveUserProfile, uploadLogo, deleteLogo, type UserProfile } from "@/lib/user-profile"
import { supabase } from "@/lib/supabase"

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
      <>
        <AppHeader title="Nastavení profilu" />
        <main className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <p className="text-muted-foreground">Načítám...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Nastavení profilu" />
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Nastavení profilu</h1>
            <p className="text-muted-foreground">Spravujte své osobní údaje a firemní informace</p>
          </div>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Uživatelský účet
              </CardTitle>
              <CardDescription>Informace o vašem účtu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
              </div>
              <div>
                <Button onClick={handleChangePassword} variant="outline">
                  Změnit heslo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Firemní údaje
              </CardTitle>
              <CardDescription>Tyto údaje se zobrazí na fakturách a smlouvách</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Název firmy</Label>
                <Input
                  id="companyName"
                  placeholder="např. Vaše firma s.r.o."
                  value={profile.companyName || ""}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="companyAddress">Adresa firmy</Label>
                <Textarea
                  id="companyAddress"
                  placeholder="např. Dlouhá 123, 110 00 Praha 1"
                  value={profile.companyAddress || ""}
                  onChange={(e) => setProfile({ ...profile, companyAddress: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyIco">IČO</Label>
                  <Input
                    id="companyIco"
                    placeholder="12345678"
                    value={profile.companyIco || ""}
                    onChange={(e) => setProfile({ ...profile, companyIco: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="companyDic">DIČ (volitelné)</Label>
                  <Input
                    id="companyDic"
                    placeholder="CZ12345678"
                    value={profile.companyDic || ""}
                    onChange={(e) => setProfile({ ...profile, companyDic: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo firmy</CardTitle>
              <CardDescription>Logo se zobrazí v hlavičce dokumentů (faktury, smlouvy)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {logoPreview && (
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 border rounded-lg flex items-center justify-center bg-white overflow-hidden">
                    <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <Button onClick={handleRemoveLogo} variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Odstranit logo
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="logo">
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
                <p className="text-xs text-muted-foreground mt-2">
                  Doporučená velikost: 200x200 px. Formáty: PNG, JPG, SVG
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button onClick={() => router.back()} variant="outline">
              Zrušit
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Ukládám..." : "Uložit změny"}
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
