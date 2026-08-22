import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { TripPhoto } from '../types'

export function usePhotos(tripId: string | null, userId: string | null) {
  const [photos, setPhotos] = useState<TripPhoto[]>([])
  const [uploading, setUploading] = useState(false)

  const fetchPhotos = useCallback(async () => {
    if (!tripId) return
    const { data } = await supabase
      .from('trip_photos')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true })
    setPhotos((data as TripPhoto[]) || [])
  }, [tripId])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  const uploadPhoto = async (file: File, caption?: string): Promise<string | null> => {
    if (!userId || !tripId) return null
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/${tripId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('trip-photos')
      .upload(path, file)
    if (uploadError) { setUploading(false); return null }

    const { data: { publicUrl } } = supabase.storage
      .from('trip-photos')
      .getPublicUrl(path)

    const { data } = await supabase
      .from('trip_photos')
      .insert([{ trip_id: tripId, user_id: userId, url: publicUrl, caption }])
      .select()
      .single()
    setPhotos(prev => [...prev, data as TripPhoto])
    setUploading(false)
    return publicUrl
  }

  const deletePhoto = async (photo: TripPhoto) => {
    const path = photo.url.split('/trip-photos/')[1]
    await supabase.storage.from('trip-photos').remove([path])
    await supabase.from('trip_photos').delete().eq('id', photo.id)
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
  }

  return { photos, uploading, uploadPhoto, deletePhoto, fetchPhotos }
}
