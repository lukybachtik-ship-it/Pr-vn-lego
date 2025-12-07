/**
 * User Profile Library
 * Manages user profile settings including logo and company information
 */

import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

export interface UserProfile {
  id: string
  userId: string
  logoUrl?: string
  companyName?: string
  companyAddress?: string
  companyIco?: string
  companyDic?: string
  createdAt: string
  updatedAt: string
}

/**
 * Get user profile from cloud
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return null

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.data.user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found", which is OK
      console.error("Error fetching user profile:", error)
      return null
    }

    if (!data) return null

    const profile: any = data

    return {
      id: profile.id,
      userId: profile.user_id,
      logoUrl: profile.logo_url,
      companyName: profile.company_name,
      companyAddress: profile.company_address,
      companyIco: profile.company_ico,
      companyDic: profile.company_dic,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }
  } catch (error) {
    console.error("Failed to get user profile:", error)
    return null
  }
}

/**
 * Save user profile to cloud
 */
export async function saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return null

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.data.user.id,
        logo_url: profile.logoUrl || null,
        company_name: profile.companyName || null,
        company_address: profile.companyAddress || null,
        company_ico: profile.companyIco || null,
        company_dic: profile.companyDic || null,
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single()

    if (error) {
      console.error("Error saving user profile:", error)
      return null
    }

    const savedProfile: any = data

    return {
      id: savedProfile.id,
      userId: savedProfile.user_id,
      logoUrl: savedProfile.logo_url,
      companyName: savedProfile.company_name,
      companyAddress: savedProfile.company_address,
      companyIco: savedProfile.company_ico,
      companyDic: savedProfile.company_dic,
      createdAt: savedProfile.created_at,
      updatedAt: savedProfile.updated_at,
    }
  } catch (error) {
    console.error("Failed to save user profile:", error)
    return null
  }
}

/**
 * Upload logo to Supabase Storage
 */
export async function uploadLogo(file: File): Promise<string | null> {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return null

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.data.user.id}/${uuidv4()}.${fileExt}`

    // Upload file
    const { data, error } = await supabase.storage.from("logos").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading logo:", error)
      return null
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error("Failed to upload logo:", error)
    return null
  }
}

/**
 * Delete logo from Supabase Storage
 */
export async function deleteLogo(logoUrl: string): Promise<boolean> {
  try {
    // Extract path from URL
    const url = new URL(logoUrl)
    const path = url.pathname.split("/logos/")[1]

    if (!path) return false

    const { error } = await supabase.storage.from("logos").remove([path])

    if (error) {
      console.error("Error deleting logo:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Failed to delete logo:", error)
    return false
  }
}
