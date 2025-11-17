"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Image, Smile, X, User } from "lucide-react"

export default function CreatePost() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [gifUrl, setGifUrl] = useState("")
  const [showImageInput, setShowImageInput] = useState(false)
  const [showGifInput, setShowGifInput] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const createPostMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/posts", {
        content,
        imageUrl: imageUrl || null,
        gifUrl: gifUrl || null,
      })
    },
    onSuccess: () => {
      setContent("")
      setImageUrl("")
      setGifUrl("")
      setShowImageInput(false)
      setShowGifInput(false)
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() && content.length <= 280) {
      createPostMutation.mutate()
    }
  }

  const characterCount = content.length
  const characterLimit = 280
  const isOverLimit = characterCount > characterLimit

  return (
    <div className="border-b border-border p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full resize-none bg-transparent text-lg outline-none placeholder:text-muted-foreground"
              rows={3}
            />

            {showImageInput && (
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("")
                    setShowImageInput(false)
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {imageUrl && (
              <div className="mt-2 relative rounded-2xl overflow-hidden border border-border">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full object-cover max-h-64"
                  onError={() => setImageUrl("")}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {showGifInput && (
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="url"
                  value={gifUrl}
                  onChange={(e) => setGifUrl(e.target.value)}
                  placeholder="Enter GIF URL"
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setGifUrl("")
                    setShowGifInput(false)
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {gifUrl && (
              <div className="mt-2 relative rounded-2xl overflow-hidden border border-border">
                <img
                  src={gifUrl}
                  alt="GIF Preview"
                  className="w-full object-cover max-h-64"
                  onError={() => setGifUrl("")}
                />
                <button
                  type="button"
                  onClick={() => setGifUrl("")}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className="rounded-full p-2 text-primary hover:bg-primary/10"
                  disabled={!!gifUrl}
                >
                  <Image className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowGifInput(!showGifInput)}
                  className="rounded-full p-2 text-primary hover:bg-primary/10"
                  disabled={!!imageUrl}
                >
                  <Smile className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div
                  className={`text-sm ${
                    isOverLimit ? "text-red-500" : "text-muted-foreground"
                  }`}
                >
                  {characterCount}/{characterLimit}
                </div>
                <button
                  type="submit"
                  disabled={
                    !content.trim() ||
                    isOverLimit ||
                    createPostMutation.isPending
                  }
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
