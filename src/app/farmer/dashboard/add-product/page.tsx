"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddProductForm } from "@/components/farmer/AddProductForm";
import { VoiceUpload } from "@/components/farmer/VoiceUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import type { VoiceUploadResult, Product } from "@/lib/types";
import { ArrowLeft, Mic, FileText } from "lucide-react";
import Link from "next/link";

export default function AddProductPage() {
  const [initialFormData, setInitialFormData] = useState<Partial<Product> | null>(null);
  const [activeTab, setActiveTab] = useState("form");
  const { translate } = useLanguage();

  const handleVoiceDataProcessed = (data: VoiceUploadResult) => {
    setInitialFormData({
      name: data.productName,
      price: data.price,
      unit: data.unit,
      location: data.location,
      // Quantity and category will need to be filled by farmer
    });
    setActiveTab("form"); // Switch to form tab to complete details
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/farmer/dashboard" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {translate('backToDashboard', 'Back to Dashboard')}
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">{translate('uploadProduct', 'Upload New Product')}</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">
            <FileText className="mr-2 h-4 w-4" />
            {translate('addByForm', 'Add by Form')}
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Mic className="mr-2 h-4 w-4" />
            {translate('addByVoice', 'Add by Voice')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="form" className="mt-6">
          <AddProductForm initialData={initialFormData} onClearInitialData={() => setInitialFormData(null)} />
        </TabsContent>
        <TabsContent value="voice" className="mt-6">
          <VoiceUpload onDataProcessed={handleVoiceDataProcessed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
