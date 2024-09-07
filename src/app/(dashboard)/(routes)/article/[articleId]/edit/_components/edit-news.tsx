"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
// @ts-ignore
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';
import { useState, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useMutation, useQuery  } from 'convex/react';
import { api } from '@/../../convex/_generated/api';
import toast from "react-hot-toast";
import { Doc, Id } from "@/../convex/_generated/dataModel";

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
});

const mdParser = new MarkdownIt({
  html:         true,
  xhtmlOut:     true,
  breaks:       true,
  highlight: function (/*str, lang*/) { return ''; }
})
.enable(['link'])
.enable('image');;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  content: z.object({
    text: z.string().min(1, "Content is required"),
    html: z.string(),
  }),
  tags: z.array(z.string().max(10)).min(1, "At least one tag is required"),
  categoryId: z.string().min(1, "Category is required"),
  image: z
    .optional( // Make the image field optional
      z.custom<FileList>()
        .refine((files) => files?.length == 1, "Image is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
          (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
          ".jpg, .jpeg, .png, and .webp files are accepted."
        )
    ),
});

interface editNewsProps {
  userId: any,
  article: Doc<"newsArticles">,
}

export default function EditNews({ userId, article }: editNewsProps) {
  console.log(article)
  const router = useRouter()
  const [tags, setTags] = useState<string[]>(article.tags || []);
  const [editorContent, setEditorContent] = useState({ text: article.content, html: article.htmlContent });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUrls, setFileUrls] = useState("")
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article.title,
      content: { text: article.content, html: article.htmlContent },
      tags: article.tags,
      categoryId: article.categoryId,
    },
  });

  const handleEditorChange = useCallback(({ html, text }: { html: string, text: string }) => {
    setEditorContent({ html, text });
    form.setValue("content", { text, html });
  }, [form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const generateUploadUrl = useMutation(api.uploadFile.generateUploadUrl);
  const saveFile = useMutation(api.uploadFile.saveFile);
  const updateNewsArticle = useMutation(api.newsArticle.editArticle)
  const deleteImageStorage = useMutation(api.uploadFile.deleteImageFromStorage)
  const deleteArticle = useMutation(api.newsArticle.deleteArticle)
  const getUserConvex = useMutation(api.user.getUserConvex)
  const categoryList = useQuery(api.category.getCategories)

  async function getFileUrl(storageId: string) {
    return `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/getImage?storageId=${storageId}`;
  }

  const onDelete = async (userId: string, article: Doc<"newsArticles">) => {
    try {
      const toastId = toast.loading('Loading...');
      
      await deleteArticle({
        articleId: article._id,
        clerkId: userId,
        authorId: article.authorId,
      })

      toast.success('Successfully delete news article', {
        id: toastId,
      });
      router.push(`/`)
    } catch (error) {
      
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // console.log('Saving content:', values);
    
    try {
      const toastId = toast.loading('Loading...');
      let fileUrls = ""
      
      if (!values.image){
        fileUrls = article.thumbnailUrl
      }else{

        // Upload image
        const file = values.image[0];
        
        toast.loading('Uploading file...', {
          id: toastId,
        });

        console.log("Full thumbnailUrl:", article.thumbnailUrl);

        const url = new URL(article.thumbnailUrl);
        const storageIdImage = url.searchParams.get('storageId');

        // @ts-ignore
        await deleteImageStorage({ storageId: storageIdImage})

        // Get upload URL
        const uploadUrl = await generateUploadUrl();
    
        // Upload file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });
    
        if (!result.ok) {
          throw new Error(`Upload failed with status ${result.status}`);
        } 

        const { storageId } = await result.json();
        console.log("Storage Id:", storageId);
    
        // Save file reference
        await saveFile({ storageId });
    
        // Get file URL
        const fileUrl = await getFileUrl(storageId);
        console.log("fileUrl:", fileUrl);
        fileUrls = fileUrl
      }
      
      // Create news article
      toast.loading('Update News', {
        id: toastId,
      });

      const convexUser = await getUserConvex({ clerkId: userId });
      
      if (!convexUser) {
        throw new Error("User not found in Convex database");
      }
      
      await updateNewsArticle({
        articleId: article._id,
        clerkId: userId,
        articleData: {
          title: values.title,
          content: values.content.text,
          htmlContent: values.content.html,
          thumbnailUrl: fileUrls,
          authorId: article.authorId,
          tags: values.tags,
          categoryId: values.categoryId as Id<"categories">,
        }
        
      });
  
      console.log('News article edited successfully!');
      toast.success('Successfully Edit News Article', {
        id: toastId,
      });

      router.push(`/article/${article._id}`)
      
      // Reset form or navigate to another page
    } catch (err) {
      console.error('Error posting news:', err);
      toast.remove();
      toast.error('Error editing news article')
    }
  }

  return (
    <div className="mx-5 my-5">
      <Dialog>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Image field */}
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
                      handleImageChange(e);
                      onChange(e.target.files);
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
                {imagePreview ? (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="max-w-xs h-auto" />
                  </div>
                ) : (
                  <div className="mt-2">
                    <img src={article.thumbnailUrl} alt="Preview" className="max-w-xs h-auto" />
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Title field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title Post</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                const newTag = inputElement.value.trim();
                if (newTag && !tags.includes(newTag)) {
                  const newTags = [...tags, newTag];
                  setTags(newTags);
                  field.onChange(newTags);
                  inputElement.value = '';
                }
              };

              return (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag(e.currentTarget);
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          onClick={() => {
                            const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement;
                            if (input) addTag(input);
                          }}
                        >
                          Add Tag
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {tag}
                            <button
                              type="button"
                              onClick={() => {
                                const newTags = tags.filter((_, i) => i !== index);
                                setTags(newTags);
                                field.onChange(newTags);
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
              );
            }}
          />

          {/* Category field */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          
          {/* Content field */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Write your article</FormLabel>
                <FormControl>
                  <MdEditor
                    style={{ height: '550px'}} 
                    renderHTML={text => mdParser.render(text)} 
                    onChange={handleEditorChange}
                    value={editorContent.text}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-between">
            <Button type="submit">Update</Button>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </DialogTrigger>
          </div>
        </form>
      </Form>
      
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure want delete this article?</DialogTitle>
            <DialogDescription>
              This article will be delete permanently. you can't restore this article anymore
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center items-center">
            <Button variant="destructive" onClick={()=> {onDelete(userId, article)}}>Delete</Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
          </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}