"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/contexts/ProductContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { Loader2, Pencil } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  quantity: z.coerce.number().int().positive("Quantity must be a positive integer."),
  unit: z.string().min(1, "Unit is required (e.g., kg, piece, bunch)."),
  category: z.string().min(3, "Category is required."),
  location: z.string().min(3, "Location is required."),
  imageUrl: z.string().url("Must be a valid URL for image (optional).").optional().or(z.literal('')),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const categories = ["Vegetables", "Fruits", "Grains", "Dairy", "Poultry", "Other"];
const units = ["kg", "gram", "litre", "ml", "piece", "dozen", "bunch", "pack"];


interface AddProductFormProps {
  initialData?: Partial<Product> | null;
  productToEdit?: Product | null;
  onClearInitialData?: () => void;
  onProductUpdated?: () => void; 
}

export function AddProductForm({ initialData, productToEdit, onClearInitialData, onProductUpdated }: AddProductFormProps) {
  const { addProduct, updateProduct: contextUpdateProduct } = useProducts();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { translate } = useLanguage();

  const isEditMode = !!productToEdit;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 1,
      unit: "kg",
      category: "",
      location: "",
      imageUrl: "",
      ...(isEditMode && productToEdit ? productToEdit : initialData),
    },
  });
  
  useEffect(() => {
    if (isEditMode && productToEdit) {
      form.reset({
        name: productToEdit.name || "",
        description: productToEdit.description || "",
        price: productToEdit.price || 0,
        quantity: productToEdit.quantity || 1,
        unit: productToEdit.unit || "kg",
        category: productToEdit.category || "",
        location: productToEdit.location || "",
        imageUrl: productToEdit.imageUrl || "",
      });
    } else if (!isEditMode && initialData) { // Only apply initialData if not in edit mode
       form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || 0,
        quantity: initialData.quantity || 1,
        unit: initialData.unit || "kg",
        category: initialData.category || "",
        location: initialData.location || "",
        imageUrl: initialData.imageUrl || "",
      });
    }
  }, [initialData, productToEdit, form, isEditMode]);


  async function onSubmit(data: ProductFormValues) {
    setIsLoading(true);
    try {
      if (isEditMode && productToEdit) {
        contextUpdateProduct({ 
            ...productToEdit, 
            ...data, 
            imageUrl: data.imageUrl || productToEdit.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(data.name)}` 
        });
        toast({
          title: translate('productUpdatedSuccessTitle', "Product Updated!"),
          description: translate('productUpdatedSuccessDesc', `${data.name} has been successfully updated.`),
        });
        if (onProductUpdated) onProductUpdated(); else router.push("/farmer/dashboard");

      } else {
        addProduct({ ...data, currency: "USD" }); 
        toast({
          title: translate('productAddedSuccessTitle', "Product Added!"),
          description: translate('productAddedSuccessDesc', `${data.name} has been successfully listed.`),
        });
        form.reset({ // Reset to default values for new product entry
            name: "", description: "", price: 0, quantity: 1, unit: "kg", category: "", location: "", imageUrl: ""
        });
        if (onClearInitialData) onClearInitialData();
        // Don't redirect here if it's from voice upload, let parent handle tab switch.
        // Only redirect if it's purely form submission for a new product without initialData.
        if (!initialData) {
          router.push("/farmer/dashboard");
        }
      }
    } catch (error) {
      toast({
        title: translate(isEditMode ? 'productUpdateErrorTitle' : 'productAddErrorTitle', "Error"),
        description: translate(isEditMode ? 'productUpdateErrorDesc' : 'productAddErrorDesc', "Failed to process product. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate('productName', 'Product Name')}</FormLabel>
              <FormControl>
                <Input placeholder={translate('productNamePlaceholder', "e.g., Fresh Tomatoes")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate('description', 'Description')}</FormLabel>
              <FormControl>
                <Textarea placeholder={translate('descriptionPlaceholder', "Describe your product...")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{translate('price', 'Price')}</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{translate('quantity', 'Quantity Available')}</FormLabel>
                <FormControl>
                    <Input type="number" step="1" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{translate('unit', 'Unit')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder={translate('selectUnit', "Select unit")} />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate('category', 'Category')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={translate('selectCategory', "Select a category")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate('location', 'Location (City, State)')}</FormLabel>
              <FormControl>
                <Input placeholder={translate('locationPlaceholder', "e.g., Nagpur, Maharashtra")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate('imageUrl', 'Image URL (Optional)')}</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormDescription>{translate('imageUrlDesc', 'Provide a link to an image of your product.')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
           {isEditMode ? (
              <>
                <Pencil className="mr-2 h-4 w-4" /> {translate('updateProductButton', 'Update Product')}
              </>
            ) : (
              initialData ? translate('confirmAndSave', 'Confirm and Save Product Details') : translate('addProductButton', 'Add Product')
            )}
        </Button>
      </form>
    </Form>
  );
}
