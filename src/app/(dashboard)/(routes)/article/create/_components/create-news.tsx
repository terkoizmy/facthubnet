"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
// @ts-ignore
import MarkdownIt from "markdown-it"
import "react-markdown-editor-lite/lib/index.css"
import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react"
import { api } from "@/../../convex/_generated/api"
import toast from "react-hot-toast"
import { Id } from "@/../convex/_generated/dataModel"

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
})

const mdParser = new MarkdownIt({
  html: true,
  xhtmlOut: true,
  breaks: true,
  highlight: function (/*str, lang*/) {
    return ""
  },
})
  .enable(["link"])
  .enable("image")

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  content: z.object({
    text: z.string().min(1, "Content is required"),
    html: z.string(),
  }),
  tags: z.array(z.string().max(17, "max 17 word per tags")).min(1, "At least one tag is required"),
  category: z.string().min(1, "Category is required"),
  image: z
    .custom<FileList>()
    .refine((files) => files?.length == 1, "Image is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
})

export default function CreateNews({ userId }: any) {
  const router = useRouter()
  const [tags, setTags] = useState<string[]>([])
  const [editorContent, setEditorContent] = useState({ text: "", html: "" })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: { text: "", html: "" },
      tags: [],
      category: "",
    },
  })

  const handleEditorChange = useCallback(
    ({ html, text }: { html: string; text: string }) => {
      setEditorContent({ html, text })
      form.setValue("content", { text, html })
    },
    [form]
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const generateUploadUrl = useMutation(api.uploadFile.generateUploadUrl)
  const saveFile = useMutation(api.uploadFile.saveFile)
  const createNewsArticle = useMutation(api.newsArticle.createNewsArticle)
  const getUserConvex = useMutation(api.user.getUserConvex)
  const categoryList = useQuery(api.category.getCategories)

  async function getFileUrl(storageId: string) {
    return `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/getImage?storageId=${storageId}`
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const convexUser = await getUserConvex({ clerkId: userId })
      if (!convexUser) {
        throw new Error("User not found in Convex database")
      }

      const toastId = toast.loading("Loading...")
      // Upload image
      const file = values.image[0]

      toast.loading("Uploading file...", {
        id: toastId,
      })

      // Get upload URL
      const uploadUrl = await generateUploadUrl()

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      if (!result.ok) {
        throw new Error(`Upload failed with status ${result.status}`)
      }

      const { storageId } = await result.json()
      console.log("Storage Id:", storageId)

      // Save file reference
      await saveFile({ storageId })

      // Get file URL
      const fileUrl = await getFileUrl(storageId)
      console.log("fileUrl:", fileUrl)

      // Create news article
      toast.loading("Creating News", {
        id: toastId,
      })

      const newArticle = await createNewsArticle({
        title: values.title,
        content: values.content.text,
        htmlContent: values.content.html,
        thumbnailUrl: fileUrl,
        authorId: convexUser._id,
        tags: values.tags,
        categoryId: values.category as Id<"categories">,
      })

      console.log("News article posted successfully!")
      toast.success("Successfully Created News Article", {
        id: toastId,
      })
      setIsLoading(false);
      router.push(`/article/${newArticle}`)

      // Reset form or navigate to another page
    } catch (err) {
      setIsLoading(false);
      console.error("Error posting news:", err)
      toast.remove()
      toast.error("Error creating news article")
    }
  }

  return (
    <div className="mx-5 my-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="image"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Thumbnail Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageChange(e)
                      onChange(e.target.files)
                    }}
                    // ref={fileInputRef}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs h-auto"
                    />
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title Post</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 'Japan Lifts Megathrust Earth...'"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => {
              const addTag = (inputElement: HTMLInputElement) => {
                const newTag = inputElement.value.trim()
                if (newTag.length >= 17){
                  toast.error("tag must be under 17 word")
                }
                else if (newTag && !tags.includes(newTag)) {
                  const newTags = [...tags, newTag]
                  setTags(newTags)
                  field.onChange(newTags)
                  inputElement.value = ""
                }
              }

              return (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addTag(e.currentTarget)
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            const input = document.querySelector(
                              'input[placeholder="Add a tag"]'
                            ) as HTMLInputElement
                            if (input) addTag(input)
                          }}
                        >
                          Add Tag
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => {
                                const newTags = tags.filter(
                                  (_, i) => i !== index
                                )
                                setTags(newTags)
                                field.onChange(newTags)
                              }}
                              className="ml-2 text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="h-[250px]">
                    {categoryList?.map((category, index) => (
                      <SelectItem key={index} value={category._id}>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Werite your article</FormLabel>
                <FormControl>
                  <MdEditor
                    style={{ height: "550px", color: "red" }}
                    renderHTML={(text) => mdParser.render(text)}
                    onChange={handleEditorChange}
                    // value={editorContent}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submiting
              </>
            ) : 'Post'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
